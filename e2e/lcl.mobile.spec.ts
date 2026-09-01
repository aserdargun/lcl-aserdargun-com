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
  await page.getByLabel('Bütçe').fill('50000')
  await finishWorkbench(page)

  await expect(page.getByRole('tab', { name: 'NVIDIA' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'AMD' }).click()
  await expect(page.getByRole('tab', { name: 'AMD' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.result-node--amd')).toBeVisible()
  await expect(page.locator('.result-node--nvidia')).toBeHidden()

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

test('keyboard order reaches the build action and theme has a non-color label', async ({ page }) => {
  await page.goto('/tr')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ana içeriğe geç' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Temayı değiştir' })).toBeAttached()
  await expect(page.getByRole('link', { name: 'Laboratuvarı oluştur' })).toBeVisible()
})
