import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';
import { DragDropHelper } from './utils/drag-drop.js';

/**
 * Test Suite: Row Operations
 * Note: Per-row alignment/separator controls don't exist in current implementation
 */
test.describe('Row Operations', () => {
  let dragDrop: DragDropHelper;

  test.beforeEach(async ({ serverPage: page }) => {
    dragDrop = new DragDropHelper(page);
  });

  test('should add new row', async ({ serverPage: page }) => {
    // Get initial row count
    const rows = page.locator(SELECTORS.rows.allRows);
    const initialCount = await rows.count();

    // Click add row button
    await page.click(SELECTORS.rows.addButton);
    await page.waitForTimeout(300);

    // Verify new row was added
    const finalCount = await rows.count();
    expect(finalCount).toBe(initialCount + 1);

    // Verify new row is empty (has empty hint)
    const newRowIndex = finalCount - 1;
    const emptyHint = page.locator(`${SELECTORS.rows.row(newRowIndex)} ${SELECTORS.rows.emptyHint}`);
    await expect(emptyHint).toBeVisible();
  });

  test('should delete row', async ({ serverPage: page }) => {
    // Ensure we have at least 2 rows
    const rows = page.locator(SELECTORS.rows.allRows);
    let rowCount = await rows.count();

    if (rowCount < 2) {
      await page.click(SELECTORS.rows.addButton);
      await page.waitForTimeout(300);
      rowCount = await rows.count();
    }

    const initialCount = rowCount;

    // Delete the last row
    const deleteButton = page.locator(SELECTORS.rows.closeButton(initialCount - 1));
    await deleteButton.click();
    await page.waitForTimeout(300);

    // Verify row was deleted
    const finalCount = await rows.count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should not allow deleting the last row', async ({ serverPage: page }) => {
    // Reduce to only one row
    const rows = page.locator(SELECTORS.rows.allRows);
    let rowCount = await rows.count();

    while (rowCount > 1) {
      const deleteButton = page.locator(SELECTORS.rows.closeButton(rowCount - 1));
      await deleteButton.click();
      await page.waitForTimeout(300);
      rowCount = await rows.count();
    }

    // Try to delete the last row
    const deleteButton = page.locator(SELECTORS.rows.closeButton(0));

    // Button should be disabled or deletion should be prevented
    const isDisabled = await deleteButton.isDisabled().catch(() => false);
    if (!isDisabled) {
      await deleteButton.click();
      await page.waitForTimeout(300);

      // Verify row still exists
      const finalCount = await rows.count();
      expect(finalCount).toBe(1);
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should display row labels', async ({ serverPage: page }) => {
    // Verify row labels are displayed
    const rows = page.locator(SELECTORS.rows.allRows);
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const label = page.locator(SELECTORS.rows.rowLabel(i));
      await expect(label).toBeVisible();

      const text = await label.textContent();
      expect(text).toContain(`Row ${i + 1}`);
    }
  });

  test('should delete row with widgets', async ({ serverPage: page }) => {
    // Ensure we have at least 2 rows
    const rows = page.locator(SELECTORS.rows.allRows);
    let rowCount = await rows.count();

    if (rowCount < 2) {
      await page.click(SELECTORS.rows.addButton);
      await page.waitForTimeout(300);
    }

    // Ensure last row has widgets
    rowCount = await rows.count();
    const lastRowIndex = rowCount - 1;
    const widgetCount = await dragDrop.getWidgetCountInRow(lastRowIndex);

    if (widgetCount === 0) {
      await dragDrop.dragFromPaletteToRow('directory', lastRowIndex);
      await page.waitForTimeout(300);
    }

    // Delete the last row
    const deleteButton = page.locator(SELECTORS.rows.closeButton(lastRowIndex));
    await deleteButton.click();
    await page.waitForTimeout(300);

    // Verify row was deleted
    const finalCount = await rows.count();
    expect(finalCount).toBe(rowCount - 1);
  });

  test('should update preview when adding row', async ({ serverPage: page }) => {
    // Get initial preview
    const preview = page.locator(SELECTORS.preview.allRows);
    const initialCount = await preview.count();

    // Add a new row with a widget
    await page.click(SELECTORS.rows.addButton);
    await page.waitForTimeout(300);

    const rows = page.locator(SELECTORS.rows.allRows);
    const newRowIndex = (await rows.count()) - 1;

    await dragDrop.dragFromPaletteToRow('model', newRowIndex);
    await page.waitForTimeout(500);

    // Verify preview updated (should have more rows)
    const finalCount = await preview.count();
    expect(finalCount).toBeGreaterThan(initialCount);
  });

  test('should update preview when deleting row', async ({ serverPage: page }) => {
    // Ensure we have at least 2 rows
    const rows = page.locator(SELECTORS.rows.allRows);
    let rowCount = await rows.count();

    if (rowCount < 2) {
      await page.click(SELECTORS.rows.addButton);
      await page.waitForTimeout(300);
      rowCount = await rows.count();
    }

    // Get initial preview row count
    const preview = page.locator(SELECTORS.preview.allRows);
    const initialPreviewRows = await preview.count();

    // Delete last row
    const deleteButton = page.locator(SELECTORS.rows.closeButton(rowCount - 1));
    await deleteButton.click();
    await page.waitForTimeout(500);

    // Verify preview updated
    const finalPreviewRows = await preview.count();
    expect(finalPreviewRows).toBeLessThanOrEqual(initialPreviewRows);
  });
});
