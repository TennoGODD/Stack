const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright'],
    ['list'],
  ],

  use: {
    baseURL: 'https://demo.app.stack-it.ru/fl/',
    headless: false,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    actionTimeout: 20000,
    ignoreHTTPSErrors: true,
    navigationTimeout: 30000,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        deviceScaleFactor: undefined,
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
