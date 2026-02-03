import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';
import { DragDropHelper } from './utils/drag-drop.js';

/**
 * Test Suite: Widget Drag & Drop
 * Updated to match actual GUI implementation
 */
test.describe('Widget Drag & Drop', () => {
  let dragDrop: DragDropHelper;

  test.beforeEach(async ({ serverPage: page }) => {
    dragDrop = new DragDropHelper(page);
  });

  test('should drag widget from palette to empty row', async ({ serverPage: page }) => {
    // Add a new empty row
    await page.click(SELECTORS.rows.addButton);
    await page.waitForTimeout(300);

    // Get row count to find the new row
    const rows = page.locator(SELECTORS.rows.allRows);
    const rowCount = await rows.count();
    const newRowIndex = rowCount - 1;

    // Count widgets before drag (should be 0)
    const initialCount = await dragDrop.getWidgetCountInRow(newRowIndex);
    expect(initialCount).toBe(0);

    // Drag a widget from palette
    await dragDrop.dragFromPaletteToRow('directory', newRowIndex);

    // Verify widget was added
    const finalCount = await dragDrop.getWidgetCountInRow(newRowIndex);
    expect(finalCount).toBe(1);

    // Verify the correct widget was added
    const widgetId = await dragDrop.getWidgetIdAt(newRowIndex, 0);
    expect(widgetId).toBe('directory');
  });

  test('should drag widget from palette to existing row', async ({ serverPage: page }) => {
    // Count widgets in first row before drag
    const initialCount = await dragDrop.getWidgetCountInRow(0);
    expect(initialCount).toBeGreaterThan(0);

    // Get initial IDs to verify addition
    const initialIds = await dragDrop.getWidgetIdsInRow(0);

    // Drag a new widget to first row (use one that's not already there)
    const newWidget = 'usageAge';
    await dragDrop.dragFromPaletteToRow(newWidget, 0);

    // Verify widget was added
    const finalCount = await dragDrop.getWidgetCountInRow(0);
    expect(finalCount).toBeGreaterThan(initialCount);

    // Verify the widget was added
    const finalIds = await dragDrop.getWidgetIdsInRow(0);
    expect(finalIds).toContain(newWidget);
  });

  // TODO: Widget-to-widget reordering requires complex event simulation
  // The native drag events work for palette-to-row but widget-to-widget
  // uses different handlers (handleWidgetDrop) that aren't triggered by synthetic events
  test.skip('should reorder widgets within same row', async ({ serverPage: page }) => {
    // Ensure first row has at least 2 non-separator widgets
    let widgetCount = await dragDrop.getWidgetCountInRow(0);
    const initialIds = await dragDrop.getWidgetIdsInRow(0);

    // Filter out separators for counting actual widgets
    const nonSeparators = initialIds.filter((id) => id !== 'separator');

    if (nonSeparators.length < 2) {
      await dragDrop.dragFromPaletteToRow('usageAge', 0);
      await page.waitForTimeout(300);
      widgetCount = await dragDrop.getWidgetCountInRow(0);
    }

    // Get order before drag
    const before = await dragDrop.getWidgetIdsInRow(0);
    expect(before.length).toBeGreaterThanOrEqual(2);

    // Drag first widget to last position
    const lastIndex = before.length - 1;
    await dragDrop.dragWidgetInRow(0, 0, 0, lastIndex);

    // Verify order changed
    const after = await dragDrop.getWidgetIdsInRow(0);
    expect(after).not.toEqual(before);

    // Verify first widget moved (should not be in first position anymore)
    expect(after[0]).not.toBe(before[0]);
  });

  test('should move widget to different row', async ({ serverPage: page }) => {
    // Ensure we have at least 2 rows
    const rows = page.locator(SELECTORS.rows.allRows);
    let rowCount = await rows.count();

    if (rowCount < 2) {
      await page.click(SELECTORS.rows.addButton);
      await page.waitForTimeout(300);
    }

    // Ensure first row has a widget
    let row0Widgets = await dragDrop.getWidgetIdsInRow(0);
    if (row0Widgets.length === 0) {
      await dragDrop.dragFromPaletteToRow('directory', 0);
      await page.waitForTimeout(300);
      row0Widgets = await dragDrop.getWidgetIdsInRow(0);
    }

    // Get widget ID from first row
    const widgetId = row0Widgets[0];
    expect(widgetId).toBeTruthy();

    // Get row 1 widgets before move
    const row1Before = await dragDrop.getWidgetIdsInRow(1);

    // Drag widget from row 0 to row 1
    const targetRow = page.locator(SELECTORS.rows.row(1));
    const sourceWidget = page.locator(SELECTORS.rows.widget(0, 0));

    await sourceWidget.dragTo(targetRow);
    await page.waitForTimeout(500);

    // Verify widget moved to row 1
    const row1After = await dragDrop.getWidgetIdsInRow(1);
    expect(row1After).toContain(widgetId);
    expect(row1After.length).toBeGreaterThan(row1Before.length);
  });

  test('should remove widget using remove button', async ({ serverPage: page }) => {
    // Ensure first row has at least one widget
    let widgetCount = await dragDrop.getWidgetCountInRow(0);
    if (widgetCount === 0) {
      await dragDrop.dragFromPaletteToRow('directory', 0);
      await page.waitForTimeout(300);
      widgetCount = await dragDrop.getWidgetCountInRow(0);
    }

    const initialCount = widgetCount;

    // Remove widget using remove button
    await dragDrop.removeWidget(0, 0);

    // Verify widget was removed (may also remove adjacent separator)
    const finalCount = await dragDrop.getWidgetCountInRow(0);
    expect(finalCount).toBeLessThan(initialCount);
    expect(finalCount).toBeGreaterThanOrEqual(initialCount - 2); // Widget + possible separator
  });

  test('should update preview after drag operation', async ({ serverPage: page }) => {
    // Get initial preview content
    const preview = page.locator(SELECTORS.preview.allRows).first();
    const initialText = await preview.textContent();

    // Add a new widget
    await dragDrop.dragFromPaletteToRow('model', 0);

    // Verify preview updated
    const finalText = await preview.textContent();
    expect(finalText).not.toBe(initialText);
  });

  test('should open config panel when clicking widget', async ({ serverPage: page }) => {
    // Ensure first row has a widget
    const widgetCount = await dragDrop.getWidgetCountInRow(0);
    expect(widgetCount).toBeGreaterThan(0);

    // Config panel should be hidden initially
    const configPanel = page.locator(SELECTORS.config.panel);
    await expect(configPanel).toHaveClass(/hidden/);

    // Click widget to open config
    await dragDrop.openWidgetConfig(0, 0);

    // Config panel should be visible
    await expect(configPanel).not.toHaveClass(/hidden/);
  });
});
