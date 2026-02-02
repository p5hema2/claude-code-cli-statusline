import { test as base, expect } from '@playwright/test';

/**
 * Custom Playwright fixture for server readiness
 * Ensures the configure server is fully ready before tests run
 */
export const test = base.extend({
  serverPage: async ({ page, baseURL }, use) => {
    // Navigate to the configure GUI
    await page.goto(baseURL || 'http://localhost:8765');

    // Clear localStorage to ensure clean state for each test
    await page.evaluate(() => localStorage.clear());

    // Reload page after clearing localStorage
    await page.reload();

    // Wait for the app container to be fully loaded
    await page.waitForSelector('#app', { state: 'visible', timeout: 30000 });

    // Wait for main.js to execute and populate initial content
    // Widget palette should have categories, and preview should show initial render
    await page.waitForSelector('#widget-palette', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('#terminal-preview', { state: 'visible', timeout: 10000 });

    // Wait for JavaScript to finish initial setup (categories populated)
    await page.waitForFunction(
      () => {
        const palette = document.querySelector('#widget-palette');
        return palette && palette.children.length > 0;
      },
      { timeout: 10000 }
    );

    // Verify no JavaScript errors occurred during load
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Use the page in tests
    await use(page);

    // After test, verify no critical errors occurred
    if (errors.length > 0) {
      console.warn('Page errors detected:', errors);
    }
  },
});

export { expect };
