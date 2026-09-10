import { expect, test, type Page } from '@playwright/test'

async function finishWorkbench(page: Page) {
  for (let step = 0; step < 4; step += 1) await page.getByRole('button', { name: 'Devam et' }).click()
  await page.getByRole('button', { name: 'Paketi hesapla' }).click()
}

test('390px navigation and result tabs work without horizontal overflow', async ({ page }) => {
  await page.goto('/tr')
  await expect(page.getByRole('heading', { level: 1, name: 'Hangi laboratuvarı almalıyım?' })).toBeVisible()
  await page.getByRole('button', { name: 'Menüyü aç veya kapat' }).click()
  await expect(page.getByRole('navigation', { name: 'Ana navigasyon' })).toBeVisible()
  await page.getByRole('link', { name: 'Workbench' }).click()
  await page.goto('/tr/build?v=1&market=TR&budget=50000&compact=0&owned=nvidia-rtx-5090-reference')
  await finishWorkbench(page)

  await expect(page.getByRole('tab', { name: 'NVIDIA' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'AMD' }).click()
  await expect(page.getByRole('tab', { name: 'AMD' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.result-node--amd')).toBeVisible()
  await expect(page.locator('.result-node--nvidia')).toBeHidden()
  await page.getByRole('tab', { name: 'AMD' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'APPLE' })).toBeFocused()
  await expect(page.locator('.result-node--apple')).toBeVisible()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('375px and 320px reflow preserve the primary workflow', async ({ page }) => {
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/tr/build?v=1&market=TR&budget=250000')
    await expect(page.getByRole('heading', { level: 1, name: 'Pazar ve bütçe' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Devam et' })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false)
  }
})

test('390px model catalog keeps wide evidence tables inside the page', async ({ page }) => {
  await page.goto('/tr/models?model=openai-gpt-oss-120b')
  await expect(page.getByRole('heading', { level: 2, name: 'gpt-oss-120b' })).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth, 'model catalog must not widen the document').toBeLessThanOrEqual(dimensions.clientWidth)
})

test('keyboard order reaches the build action and theme has a non-color label', async ({ page }) => {
  await page.goto('/tr')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ana içeriğe geç' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Temayı değiştir' })).toBeAttached()
  await expect(page.getByRole('link', { name: 'Laboratuvarı oluştur' })).toBeVisible()
})

test('every page reflows at 320px and 390px', async ({ page }) => {
  test.setTimeout(120_000)
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    for (const locale of ['tr', 'en']) {
      for (const route of ['', '/build', '/models', '/devices', '/compare', '/benchmarks', '/learn', '/methodology', '/changes', '/not-found']) {
        await page.goto(`/${locale}${route}`)
        await expect(page.locator('main h1')).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${width}px ${locale}${route}`).toBe(true)
      }
    }
  }
})

test('mobile menu closes with Escape and restores keyboard focus', async ({ page }) => {
  await page.goto('/en')
  const menu = page.getByRole('button', { name: 'Toggle menu' })
  await menu.click()
  await page.getByRole('link', { name: 'Models', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
})
