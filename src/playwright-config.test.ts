import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test('an external production URL disables the local Playwright web server', async () => {
  vi.stubEnv('PLAYWRIGHT_BASE_URL', 'https://example.test')

  const config = (await import('../playwright.config')).default

  expect(config.use?.baseURL).toBe('https://example.test')
  expect(config.webServer).toBeUndefined()
}, 15_000)
