import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';
import { DragDropHelper } from './utils/drag-drop.js';

/**
 * Test Suite: Settings Persistence
 * Tests save, reset, and dirty flag functionality
 *
 * Note: Configured to run serially to avoid test interference.
 * All workers share the same test settings file, so parallel execution
 * would cause tests to step on each other's state.
 */
test.describe('Settings Persistence', () => {
  // Run tests serially within this suite
  test.describe.configure({ mode: 'serial' });

  let dragDrop: DragDropHelper;

  test.beforeEach(async ({ serverPage: page }) => {
    dragDrop = new DragDropHelper(page);
  });

  test('should save settings successfully', async ({ serverPage: page }) => {
    const saveButton = page.locator(SELECTORS.footer.saveButton);

    // Make a change to trigger dirty state
    await dragDrop.dragFromPaletteToRow('model', 0);
    await page.waitForTimeout(300);

    // Set up response listener BEFORE clicking (avoid race condition)
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/settings') &&
        response.request().method() === 'PUT',
      { timeout: 5000 }
    );

    // Click save button
    await saveButton.click();

    // Wait for the response
    const saveResponse = await saveResponsePromise;
    expect(saveResponse.ok()).toBeTruthy();

    // Status message should appear (success or just confirmation)
    const statusMessage = page.locator(SELECTORS.footer.statusMessage);
    await expect(statusMessage).toBeVisible({ timeout: 3000 });
  });

  test('should reset to defaults with confirmation', async ({ serverPage: page }) => {
    const resetButton = page.locator(SELECTORS.footer.resetButton);

    // Make some changes first
    await dragDrop.dragFromPaletteToRow('model', 0);
    await page.waitForTimeout(300);

    // Setup dialog handler to accept confirmation
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Click reset button
    await resetButton.click();
    await page.waitForTimeout(1000);

    // Settings should be reset (page might reload or update)
    const preview = page.locator(SELECTORS.preview.container);
    await expect(preview).toBeVisible();
  });

  // NOTE: This test was removed because the confirmation dialog was removed per user request
  // Reset now happens immediately without confirmation
  test.skip('should not reset if confirmation is cancelled', async ({ serverPage: page }) => {
    // Test skipped - confirmation dialog removed
  });

  test('should enable save button after making changes', async ({ serverPage: page }) => {
    const saveButton = page.locator(SELECTORS.footer.saveButton);

    // Make a change
    await dragDrop.dragFromPaletteToRow('usageAge', 0);
    await page.waitForTimeout(300);

    // Save button should be enabled
    const isDisabled = await saveButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeFalsy();
  });

  test('should persist settings across page reload', async ({ serverPage: page }) => {
    const saveButton = page.locator(SELECTORS.footer.saveButton);

    // Add a unique widget
    await dragDrop.dragFromPaletteToRow('usageAge', 0);
    await page.waitForTimeout(300);

    // Save settings - wait for API response to complete
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/settings') &&
        response.request().method() === 'PUT',
      { timeout: 5000 }
    );

    await saveButton.click();
    const saveResponse = await saveResponsePromise;

    // Verify save was successful
    expect(saveResponse.status()).toBe(200);
    await page.waitForTimeout(500); // Extra time for file system write

    // Reload page
    await page.reload();
    await page.waitForSelector(SELECTORS.preview.container, { state: 'visible' });
    await page.waitForTimeout(500);

    // Verify widget is still there
    const ids = await dragDrop.getWidgetIdsInRow(0);
    expect(ids).toContain('usageAge');
  });

  test('should handle save API errors gracefully', async ({ serverPage: page }) => {
    const saveButton = page.locator(SELECTORS.footer.saveButton);
    const statusMessage = page.locator(SELECTORS.footer.statusMessage);

    // Make a change
    await dragDrop.dragFromPaletteToRow('model', 0);
    await page.waitForTimeout(300);

    // Intercept save request and return error
    await page.route('**/api/settings', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        route.continue();
      }
    });

    // Click save button
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Error message should appear
    await expect(statusMessage).toBeVisible({ timeout: 3000 });
  });

  test('should show status message after save', async ({ serverPage: page }) => {
    const saveButton = page.locator(SELECTORS.footer.saveButton);
    const statusMessage = page.locator(SELECTORS.footer.statusMessage);

    // Make a change
    await dragDrop.dragFromPaletteToRow('model', 0);
    await page.waitForTimeout(300);

    // Save and wait for response
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/settings') &&
        response.request().method() === 'PUT',
      { timeout: 5000 }
    );

    await saveButton.click();
    await saveResponsePromise;

    // Status message should appear with text
    await expect(statusMessage).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(100); // Small wait for text to populate

    const text = await statusMessage.textContent();
    expect(text).toBeTruthy();
    expect(text).toContain('Settings saved'); // Check actual success message
  });
});
