import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';

/**
 * Test Suite: Initial Load & Data Fetching
 * Verifies that the GUI loads correctly and fetches all required data
 */
test.describe('Initial Load & Data Fetching', () => {
  test('should load the page without errors', async ({ serverPage: page }) => {
    // Verify app container is visible
    await expect(page.locator(SELECTORS.app.container)).toBeVisible();

    // Verify no loading spinner is present (load complete)
    await expect(page.locator(SELECTORS.app.loading)).not.toBeVisible();
  });

  test('should load settings from API', async ({ page, baseURL }) => {
    // Start listening before page load
    const settingsPromise = page.waitForResponse(
      (response) => response.url().includes('/api/settings'),
      { timeout: 30000 }
    );

    // Navigate to page
    await page.goto(baseURL || 'http://localhost:8765');

    // Wait for API response
    const settingsResponse = await settingsPromise;
    expect(settingsResponse.ok()).toBeTruthy();

    const response = await settingsResponse.json();
    expect(response.success).toBeTruthy();
    expect(response.data).toHaveProperty('rows');
    expect(Array.isArray(response.data.rows)).toBeTruthy();
  });

  test('should load widget metadata from API', async ({ page, baseURL }) => {
    // Start listening before page load
    const widgetsPromise = page.waitForResponse(
      (response) => response.url().includes('/api/widgets'),
      { timeout: 30000 }
    );

    // Navigate to page
    await page.goto(baseURL || 'http://localhost:8765');

    // Wait for API response
    const widgetsResponse = await widgetsPromise;
    expect(widgetsResponse.ok()).toBeTruthy();

    const response = await widgetsResponse.json();
    expect(response.success).toBeTruthy();

    // Widgets response has { success, data: { widgets: [...] } }
    expect(response.data).toHaveProperty('widgets');
    expect(Array.isArray(response.data.widgets)).toBeTruthy();
    expect(response.data.widgets.length).toBeGreaterThan(0);

    // Verify widget has required schema properties
    const firstWidget = response.data.widgets[0];
    expect(firstWidget).toHaveProperty('id');
    expect(firstWidget).toHaveProperty('name');
    expect(firstWidget).toHaveProperty('category');
    expect(firstWidget).toHaveProperty('description');
  });

  test('should populate terminal palette dropdown', async ({ serverPage: page }) => {
    const terminalSelect = page.locator(SELECTORS.controls.terminalSelect);
    await expect(terminalSelect).toBeVisible();

    // Verify it has options
    const options = await terminalSelect.locator('option').count();
    expect(options).toBeGreaterThan(1); // At least default + one theme
  });

  test('should render initial preview', async ({ serverPage: page }) => {
    // Preview container should be visible
    await expect(page.locator(SELECTORS.preview.container)).toBeVisible();

    // Preview rows should be rendered (there can be multiple rows)
    const previewRows = page.locator('.preview-row');
    const rowCount = await previewRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // First preview row should have content
    const firstRow = previewRows.first();
    await expect(firstRow).toBeVisible();
    const content = await firstRow.textContent();
    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(0);
  });

  test('should organize widget palette by categories', async ({ serverPage: page }) => {
    const palette = page.locator(SELECTORS.palette.container);
    await expect(palette).toBeVisible();

    // Should have category headers
    const categories = page.locator('.palette-category');
    const categoryCount = await categories.count();
    expect(categoryCount).toBeGreaterThan(0);

    // Each category should have widgets
    for (let i = 0; i < categoryCount; i++) {
      const category = categories.nth(i);
      const widgets = category.locator('[data-widget-id]');
      const widgetCount = await widgets.count();
      expect(widgetCount).toBeGreaterThan(0);
    }
  });

  test('should display configured rows in row editor', async ({ serverPage: page }) => {
    const rowList = page.locator(SELECTORS.rows.list);
    await expect(rowList).toBeVisible();

    // Should have at least one row
    const rows = page.locator('[data-row-index]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should not have console errors', async ({ serverPage: page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Trigger some interactions to ensure no errors
    await page.reload();
    await page.waitForSelector(SELECTORS.preview.container, { state: 'visible' });

    // Filter out known non-critical errors (e.g., favicon 404)
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') && !error.includes('404')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
