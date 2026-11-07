import { defineConfig, devices } from '@playwright/test';

const port = 4329;
const base = process.env.BASE ?? '/eutenia-site';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}${base.replace(/\/?$/, '/')}`,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${port} --ignore-lock`,
    env: { EUTENIA_CONTENT: 'fixtures' },
    url: `http://localhost:${port}${base.replace(/\/?$/, '/')}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
