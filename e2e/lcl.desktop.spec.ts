import { expect, test, type Page } from '@playwright/test'
import { catalog } from '../src/data/catalog'
import { learnConcepts } from '../src/data/education'

async function finishWorkbench(page: Page) {
  for (let step = 0; step < 4; step += 1) await page.getByRole('button', { name: 'Devam et' }).click()
  await page.getByRole('button', { name: 'Paketi hesapla' }).click()
}

test('Turkish decision flow exposes evidence, cross-links, and a versioned scenario', async ({ page }) => {
  await page.goto('/tr')
  await expect(page.getByRole('heading', { level: 1, name: 'Hangi laboratuvarı almalıyım?' })).toBeVisible()
  const atlasLink = page.locator('.horizon__node', { hasText: 'LLM Runtime & Serving Atlas' }).first()
  await expect(atlasLink).toHaveAttribute('href', 'https://llm.aserdargun.com/')

  await page.getByRole('link', { name: 'Laboratuvarı oluştur' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Pazar ve bütçe' })).toBeVisible()
  await page.goto('/tr/build?v=1&market=TR&budget=50000&compact=0&owned=nvidia-rtx-5090-reference')
  await finishWorkbench(page)

  await expect(page.getByRole('heading', { level: 1, name: 'Üç ekosistemli laboratuvarınız' })).toBeVisible()
  await expect(page.getByText(/Bütçe farkı/)).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Fazlı alım planı' })).toBeVisible()
  await expect(page).toHaveURL(/v=1&market=TR&budget=50000/)
})

test('US and DE market packages keep their local tax bases', async ({ page }) => {
  for (const scenario of [
    { market: 'US', budget: '15000', disclosure: 'ABD fiyatları satış vergisi hariçtir' },
    { market: 'DE', budget: '12000', disclosure: 'Almanya fiyatları KDV dahil' },
  ]) {
    await page.goto(`/tr/build?v=1&market=${scenario.market}&budget=${scenario.budget}`)
    await expect(page.getByText(new RegExp(scenario.disclosure))).toBeVisible()
    await finishWorkbench(page)
    await expect(page.getByRole('heading', { level: 1, name: scenario.market === 'DE' ? 'Bu koşullarla paket oluşturulamıyor' : 'Üç ekosistemli laboratuvarınız' })).toBeVisible()
    await expect(page.locator('.budget-warning')).toHaveCount(0)
  }
})

test('horizon cross-link strip and /learn route are navigable from the Turkish shell', async ({ page }) => {
  await page.goto('/tr')

  const horizonNodes = page.locator('.horizon__node')
  expect(await horizonNodes.count()).toBeGreaterThanOrEqual(3)
  await expect(horizonNodes.filter({ hasText: 'LLM Runtime & Serving Atlas' })).toHaveAttribute('href', /^https:\/\/llm\.aserdargun\.com/)

  await page.getByRole('link', { name: 'Öğren' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Workbench kararını kavramadan veremezsin.' })).toBeVisible()
  await expect(page.getByTestId('flashcard-deck')).toBeVisible()
})

test('owned RTX fills NVIDIA at zero additional acquisition cost', async ({ page }) => {
  await page.goto('/tr/build?v=1&market=TR&budget=500000&compact=0&owned=nvidia-rtx-5090-reference')
  await finishWorkbench(page)

  const nvidia = page.locator('.result-node--nvidia')
  await expect(nvidia).toContainText('RTX 5090 ana makinesi')
  await expect(nvidia).toContainText('Ek maliyet yok')
  await expect(page.locator('.budget-warning')).toHaveCount(0)
})

test('model-to-device and change evidence remain navigable', async ({ page }) => {
  await page.goto('/tr/models?model=openai-gpt-oss-120b')
  await expect(page.getByRole('heading', { level: 2, name: 'gpt-oss-120b' })).toBeVisible()
  await page.getByRole('link', { name: 'DGX Spark' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Yerel cihazlar' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'DGX Spark' })).toBeVisible()

  await page.goto('/tr/changes')
  await expect(page.getByText(/lcl-2026-09-10-[a-f0-9]{12}/)).toBeVisible()
  await expect(page.getByText('Güncel').first()).toBeVisible()
  await expect(page.getByText('Dil, biçim ve veri tazeliği güncellemesi')).toBeVisible()
})

test('English route preserves the product structure', async ({ page }) => {
  await page.goto('/en/devices')
  await expect(page.getByRole('heading', { level: 1, name: 'Local devices' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Models' })).toHaveAttribute('href', '/en/models')
  await page.getByRole('link', { name: 'Methodology' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Methodology' })).toBeVisible()
})

test('light theme is explicit and persists only in this browser', async ({ page }) => {
  await page.goto('/tr')
  await page.getByRole('button', { name: 'Temayı değiştir' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(245, 247, 246)')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('hard requirements explain why a package is ineligible', async ({ page }) => {
  for (const query of ['market=TR&budget=999999&compact=1', 'market=US&budget=15000&power=100']) {
    await page.goto(`/tr/build?v=1&${query}`)
    await finishWorkbench(page)
    await expect(page.getByRole('heading', { name: 'Bu koşullarla paket oluşturulamıyor' })).toBeVisible()
    await expect(page.locator('.result-node')).toHaveCount(0)
    await page.getByRole('button', { name: 'Senaryoyu düzenle' }).click()
    await expect(page.getByRole('heading', { name: 'Pazar ve bütçe' })).toBeVisible()
  }
})

test('clipboard and storage failures never report success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } })
    Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError') }
  })
  await page.goto('/tr/build?v=1&market=US&budget=15000')
  await finishWorkbench(page)
  await page.getByRole('button', { name: 'Paylaşım URL’si' }).click()
  await expect(page.getByRole('alert')).toContainText('Bağlantı kopyalanamadı')
  await expect(page.getByRole('button', { name: 'Kopyalandı', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Bu senaryoyu tarayıcıda sakla' }).click()
  await expect(page.getByRole('alert')).toContainText('Tarayıcı kaydı değiştirilemedi')
  await expect(page.getByRole('button', { name: 'Tarayıcı kaydını sil' })).toHaveCount(0)
})

test('editing a saved scenario can update the saved value', async ({ page }) => {
  await page.goto('/tr/build?v=1&market=US&budget=15000')
  await finishWorkbench(page)
  await page.getByRole('button', { name: 'Bu senaryoyu tarayıcıda sakla' }).click()
  await page.getByRole('button', { name: 'Senaryoyu düzenle' }).click()
  await page.getByLabel('Bütçe', { exact: true }).fill('16000')
  await finishWorkbench(page)
  await page.getByRole('button', { name: 'Bu senaryoyu tarayıcıda sakla' }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lcl-saved-scenario-v1')!).budget)).toBe(16000)
  await page.reload()
  await expect(page.getByLabel('Bütçe', { exact: true })).toHaveValue('16000')
})

test('learning due dates and shuffled filters show the correct cards', async ({ page }) => {
  const due = learnConcepts[0]
  await page.addInitScript((id) => {
    localStorage.setItem('lcl-learn-progress-v1', JSON.stringify({ updatedAt: Date.now(), status: { [id]: 'known' }, nextReviewAt: { [id]: Date.now() - 1000 } }))
  }, due.id)
  await page.goto('/en/learn')
  await page.getByTestId('flashcard-filter-soon').click()
  await expect(page.getByTestId(`flashcard-card-${due.id}`)).toBeVisible()
  await page.getByTestId('flashcard-filter-fresh').click()
  await page.getByRole('button', { name: 'Shuffle', exact: true }).click()
  await page.getByTestId('flashcard-filter-mastered').click()
  await expect(page.getByTestId('flashcard-empty')).toBeVisible()
  const target = learnConcepts[5]
  await page.getByTestId(`learn-concept-${target.id}`).getByRole('button', { name: 'Open the card' }).click()
  await expect(page.getByTestId(`flashcard-card-${target.id}`)).toBeVisible()
  await page.getByTestId('flashcard-reveal').click()
  await expect(page.locator('.flashcard__definition')).toHaveText(target.definition.en)
})

test('scenario URL and locale changes preserve inputs', async ({ page }) => {
  await page.goto('/tr/build')
  await page.getByLabel('Bütçe', { exact: true }).fill('321000')
  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/build\?v=1.*budget=321000/)
  await expect(page.getByLabel('Budget', { exact: true })).toHaveValue('321000')
  await page.reload()
  await expect(page.getByLabel('Budget', { exact: true })).toHaveValue('321000')
})

test('catalog navigation preserves empty selections and ecosystem filters', async ({ page }) => {
  await page.goto(`/en/compare?devices=${catalog.devices[0].id},${catalog.devices[0].id}`)
  await expect(page.getByText('1/4', { exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: catalog.devices[0].name }).click()
  await expect(page.getByRole('checkbox', { name: catalog.devices[0].name })).not.toBeChecked()
  await expect(page.getByText('0/4', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Select devices to compare.')).toBeVisible()
  await page.goto('/en/devices?device=nvidia-dgx-spark')
  await page.getByLabel('Ecosystem', { exact: true }).selectOption('apple')
  await expect(page.locator('.device-profile')).toHaveClass(/device-profile--apple/)
  await page.goto('/tr/models')
  await page.getByRole('searchbox').fill('bulunmayan-model-xyz')
  await expect(page.getByText('Aramanızla eşleşen model yok.')).toBeVisible()
})

test('all localized pages render without runtime errors or overflow in both themes', async ({ page }) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  for (const locale of ['tr', 'en']) {
    for (const route of ['', '/build', '/models', '/devices', '/compare', '/benchmarks', '/learn', '/methodology', '/changes', '/not-found']) {
      await page.goto(`/${locale}${route}`)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      for (const theme of ['dark', 'light']) {
        await page.evaluate((value) => { document.documentElement.dataset.theme = value }, theme)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      }
    }
  }
  expect(errors).toEqual([])
})
