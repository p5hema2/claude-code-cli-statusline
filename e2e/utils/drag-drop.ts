import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { SELECTORS } from './selectors.js';

/**
 * Drag & Drop Helper Utilities
 * Updated to match actual GUI implementation (Phase 7 refactoring)
 */
export class DragDropHelper {
  constructor(private page: Page) {}

  /**
   * Drag a widget from the palette to a row
   * The row accepts the drop anywhere in its container
   */
  async dragFromPaletteToRow(
    widgetId: string,
    rowIndex: number
  ): Promise<void> {
    const source = this.page.locator(SELECTORS.palette.widget(widgetId));
    const targetRow = this.page.locator(SELECTORS.rows.row(rowIndex));

    await this.performDrag(source, targetRow);
  }

  /**
   * Drag a widget from one position to another
   * Uses data-widget-index for precise targeting
   */
  async dragWidgetInRow(
    fromRow: number,
    fromWidgetIndex: number,
    toRow: number,
    toWidgetIndex: number
  ): Promise<void> {
    const source = this.page.locator(
      SELECTORS.rows.widget(fromRow, fromWidgetIndex)
    );
    const target = this.page.locator(
      SELECTORS.rows.widget(toRow, toWidgetIndex)
    );

    await this.performDrag(source, target);
  }

  /**
   * Remove a widget using its remove button (no trash zone drag)
   * Button is only visible on hover
   */
  async removeWidget(rowIndex: number, widgetIndex: number): Promise<void> {
    const widget = this.page.locator(
      SELECTORS.rows.widget(rowIndex, widgetIndex)
    );

    // Hover over widget to show remove button
    await widget.hover();
    await this.page.waitForTimeout(200);

    const removeButton = this.page.locator(
      SELECTORS.rows.widgetRemoveButton(rowIndex, widgetIndex)
    );

    await removeButton.click({ force: true });
    await this.page.waitForTimeout(300);
  }

  /**
   * Click a widget to open its config panel
   */
  async openWidgetConfig(rowIndex: number, widgetIndex: number): Promise<void> {
    const widget = this.page.locator(
      SELECTORS.rows.widget(rowIndex, widgetIndex)
    );

    await widget.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Core drag operation using Playwright's drag API
   */
  private async performDrag(source: Locator, target: Locator): Promise<void> {
    // Wait for elements to be ready
    await source.waitFor({ state: 'visible', timeout: 10000 });
    await target.waitFor({ state: 'visible', timeout: 10000 });

    // Scroll elements into view
    await source.scrollIntoViewIfNeeded();
    await target.scrollIntoViewIfNeeded();

    // Use native HTML5 drag-drop events via page.evaluate
    await this.page.evaluate(({ sourceSelector, targetSelector }) => {
      const sourceEl = document.querySelector(sourceSelector) as HTMLElement;
      const targetEl = document.querySelector(targetSelector) as HTMLElement;

      if (!sourceEl || !targetEl) {
        throw new Error('Could not find source or target elements');
      }

      // Get widget ID from source element
      const widgetId = sourceEl.dataset.widgetId ||
                      (sourceEl.closest('[data-widget-id]') as HTMLElement)?.dataset.widgetId;

      // Create DataTransfer and set widget ID
      const dataTransfer = new DataTransfer();
      if (widgetId) {
        dataTransfer.setData('text/plain', widgetId);
      }

      // Create and dispatch dragstart event
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      sourceEl.dispatchEvent(dragStartEvent);

      // Create and dispatch dragover event on target
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
        clientX: targetEl.getBoundingClientRect().left + 10,
        clientY: targetEl.getBoundingClientRect().top + 10,
      });
      targetEl.dispatchEvent(dragOverEvent);

      // Create and dispatch drop event on target
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
        clientX: targetEl.getBoundingClientRect().left + 10,
        clientY: targetEl.getBoundingClientRect().top + 10,
      });
      targetEl.dispatchEvent(dropEvent);

      // Create and dispatch dragend event on source
      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      sourceEl.dispatchEvent(dragEndEvent);
    }, {
      sourceSelector: await this.getSelector(source),
      targetSelector: await this.getSelector(target),
    });

    // Wait for preview to update and DOM to settle
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get CSS selector string from a Locator
   */
  private async getSelector(locator: Locator): Promise<string> {
    // Evaluate to get the actual selector used
    const elementHandle = await locator.elementHandle();
    if (!elementHandle) {
      throw new Error('Could not get element handle');
    }

    const selector = await this.page.evaluate((el) => {
      // Try to get an ID
      if (el.id) return `#${el.id}`;

      // Try to get a unique data attribute
      if (el.dataset.widgetId) return `[data-widget-id="${el.dataset.widgetId}"]`;
      if (el.dataset.rowIndex !== undefined) {
        if (el.dataset.widgetIndex !== undefined) {
          return `[data-row-index="${el.dataset.rowIndex}"][data-widget-index="${el.dataset.widgetIndex}"]`;
        }
        return `[data-row-index="${el.dataset.rowIndex}"]`;
      }

      // Fallback to class-based selector
      if (el.className) {
        const classes = el.className.split(' ').filter((c: string) => c).join('.');
        return `.${classes}`;
      }

      throw new Error('Could not determine selector for element');
    }, elementHandle);

    await elementHandle.dispose();
    return selector;
  }

  /**
   * Get the number of widgets in a specific row
   */
  async getWidgetCountInRow(rowIndex: number): Promise<number> {
    const widgets = this.page.locator(SELECTORS.rows.allWidgetsInRow(rowIndex));
    return await widgets.count();
  }

  /**
   * Get widget ID at a specific index
   */
  async getWidgetIdAt(rowIndex: number, widgetIndex: number): Promise<string | null> {
    const widget = this.page.locator(
      SELECTORS.rows.widget(rowIndex, widgetIndex)
    );

    const count = await widget.count();
    if (count === 0) {
      return null;
    }

    return await widget.getAttribute('data-widget-id');
  }

  /**
   * Get all widget IDs in a row (in order)
   */
  async getWidgetIdsInRow(rowIndex: number): Promise<string[]> {
    const widgets = this.page.locator(SELECTORS.rows.allWidgetsInRow(rowIndex));
    const count = await widgets.count();

    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const widget = widgets.nth(i);
      const id = await widget.getAttribute('data-widget-id');
      if (id) ids.push(id);
    }

    return ids;
  }

  /**
   * Verify widget order in a row
   */
  async verifyWidgetOrder(
    rowIndex: number,
    expectedWidgetIds: string[]
  ): Promise<void> {
    const actualIds = await this.getWidgetIdsInRow(rowIndex);
    expect(actualIds).toEqual(expectedWidgetIds);
  }
}
