/**
 * Status line renderer
 *
 * Assembles widgets into a complete status line output.
 * Handles smart separator logic - skipping separators when adjacent widgets are empty.
 */

import defaultSettings from '../defaults/statusline.json' with { type: 'json' };
import type { WidgetConfig , RenderContext } from '../types/index.js';
import { WIDGET_REGISTRY } from '../widgets/index.js';

/** Collected item after rendering */
interface RenderedItem {
  isSeparator: boolean;
  output: string;
}

/**
 * Render a row of widgets with inline configuration
 *
 * Implements smart separator logic:
 * - Empty widgets are filtered out first
 * - Leading and trailing separators are removed
 * - Consecutive separators are collapsed into one
 *
 * This ensures proper separator handling when widgets in the middle
 * of a row return null (e.g., gitBranch when not in a repo).
 *
 * @param widgetConfigs - Array of widget configurations for this row
 * @param ctx - Render context
 * @returns Rendered row string
 */
function renderRow(widgetConfigs: WidgetConfig[], ctx: RenderContext): string {
  // First pass: render all widgets and collect non-null outputs
  const items: RenderedItem[] = [];

  for (const config of widgetConfigs) {
    const entry = WIDGET_REGISTRY[config.widget];
    if (!entry) continue;

    const output = entry.widget.render(ctx, config);
    if (!output) continue;

    items.push({
      isSeparator: config.widget === 'separator',
      output,
    });
  }

  // Second pass: clean up separators
  // Remove leading separators
  while (items.length > 0 && items[0].isSeparator) {
    items.shift();
  }

  // Remove trailing separators
  while (items.length > 0 && items[items.length - 1].isSeparator) {
    items.pop();
  }

  // Remove consecutive separators (keep first one only)
  const cleaned: RenderedItem[] = [];
  for (const item of items) {
    // Skip if this is a separator and previous item was also a separator
    if (item.isSeparator && cleaned.length > 0 && cleaned[cleaned.length - 1].isSeparator) {
      continue;
    }
    cleaned.push(item);
  }

  return cleaned.map((item) => item.output).join('');
}

/**
 * Get default settings rows
 */
function getDefaultRows(): WidgetConfig[][] {
  return defaultSettings.rows as WidgetConfig[][];
}

/**
 * Render the complete status line
 *
 * Iterates through rows, renders each one, and joins with newlines.
 *
 * @param ctx - Render context with status, usage, and settings
 * @returns Rendered status line string
 */
export function renderStatusLine(ctx: RenderContext): string {
  const { settings } = ctx;
  const rows = settings.rows ?? getDefaultRows();

  if (!rows || rows.length === 0) {
    return '';
  }

  const renderedRows: string[] = [];

  for (const widgetConfigs of rows) {
    const rendered = renderRow(widgetConfigs, ctx);
    if (rendered) {
      renderedRows.push(rendered);
    }
  }

  return renderedRows.join('\n');
}

/**
 * Render multi-row status line
 *
 * @deprecated Use renderStatusLine instead - rows are now the default format
 * @param ctx - Render context with status, usage, and settings
 * @returns Rendered multi-row status line string
 */
export function renderMultiRowStatusLine(ctx: RenderContext): string {
  return renderStatusLine(ctx);
}

/**
 * Render status line as array of row strings
 *
 * Used by the configuration GUI to get individual rows for preview.
 *
 * @param ctx - Render context with status, usage, and settings
 * @returns Array of rendered row strings
 */
export function renderStatusLineRows(ctx: RenderContext): string[] {
  const { settings } = ctx;
  const rows = settings.rows ?? getDefaultRows();

  if (!rows || rows.length === 0) {
    return [];
  }

  const renderedRows: string[] = [];

  for (const widgetConfigs of rows) {
    const rendered = renderRow(widgetConfigs, ctx);
    renderedRows.push(rendered);
  }

  return renderedRows;
}

/**
 * Render a single widget by name
 *
 * @param name - Widget name
 * @param ctx - Render context
 * @param config - Optional inline widget configuration
 * @returns Rendered widget string or null
 */
export function renderWidget(
  name: string,
  ctx: RenderContext,
  config?: WidgetConfig
): string | null {
  const entry = WIDGET_REGISTRY[name];
  if (!entry) return null;
  return entry.widget.render(ctx, config);
}

/**
 * Get list of available widget names
 *
 * @returns Array of widget names
 */
export function getWidgetNames(): string[] {
  return Object.keys(WIDGET_REGISTRY);
}
