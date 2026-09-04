import { expect, test, type Page } from '@playwright/test'

async function finishWorkbench(page: Page) {
  for (let step = 0; step < 4; step += 1) await page.getByRole('button', { name: 'Devam et' }).click()
  await page.getByRole('button', { name: 'Paketi hesapla' }).click()
}

test('Turkish decision flow exposes evidence, cross-links, and a versioned scenario', async ({ page }) => {
  await page.goto('/tr')
  await expect(page.getByRole('heading', { level: 1, name: 'Hangi laboratuvarı almalıyım?' })).toBeVisible()
  const atlasLink = page.locator('.horizon__node', { hasText: 'LLM Runtime Atlas' }).first()
  await expect(atlasLink).toHaveAttribute('href', 'https://llm.aserdargun.com/')

  await page.getByRole('link', { name: 'Laboratuvarı oluştur' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Pazar ve bütçe' })).toBeVisible()
  await page.getByLabel('Bütçe').fill('50000')
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
    await expect(page.getByRole('heading', { level: 1, name: 'Üç ekosistemli laboratuvarınız' })).toBeVisible()
    await expect(page.locator('.budget-warning')).toHaveCount(0)
  }
})

test('horizon cross-link strip and /learn route are navigable from the Turkish shell', async ({ page }) => {
  await page.goto('/tr')

  const horizonNodes = page.locator('.horizon__node')
  expect(await horizonNodes.count()).toBeGreaterThanOrEqual(3)
  await expect(horizonNodes.filter({ hasText: 'LLM Runtime Atlas' })).toHaveAttribute('href', /^https:\/\/llm\.aserdargun\.com/)

  await page.getByRole('link', { name: 'Öğren' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Workbench kararını kavramadan veremezsin.' })).toBeVisible()
  await expect(page.getByTestId('flashcard-deck')).toBeVisible()
})

test('owned RTX fills NVIDIA at zero additional acquisition cost', async ({ page }) => {
  await page.goto('/tr/build?v=1&market=TR&budget=500000&owned=nvidia-rtx-5090-reference')
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
  await expect(page.getByText('lcl-2026-09-04-15bf89caa212')).toBeVisible()
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
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 240, 233)')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})
