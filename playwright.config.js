// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * For SwiftTranslator negative scenario tests
 */
export default defineConfig({
  testDir: './tests',       // folder with your test files
  fullyParallel: true,      // run tests in parallel
  forbidOnly: !!process.env.CI,   // prevent test.only in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',         // HTML report
  use: {
    // Set base URL for your tests
    baseURL: 'https://swifttranslator.com',  
    trace: 'on-first-retry', // collect trace for failed test retries
    headless: true,           // run in headless mode (CI friendly)
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment below if you want cross-browser testing
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  // Only needed if testing a local app
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
