import { defineConfig, devices } from '@playwright/test'

const localPort = process.env.CODEX_LOCAL_PORT ?? '4173'
const localUrl = `http://127.0.0.1:${localPort}`
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBaseUrl ?? localUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      testMatch: '**/*.desktop.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'mobile-chromium',
      testMatch: '**/*.mobile.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: externalBaseUrl ? undefined : {
    command: `npm run dev -- --host 127.0.0.1 --port ${localPort} --strictPort`,
    url: `${localUrl}/tr`,
    reuseExistingServer: !process.env.CI,
  },
})
