/**
 * Status line renderer
 *
 * Assembles widgets into a complete status line output.
 */

import type { RenderContext } from '../types/Widget.js';
import type { RowAlign } from '../types/Settings.js';
import { DEFAULT_WIDGETS, WIDGET_REGISTRY } from '../widgets/index.js';
import { separator } from './colors.js';
import { isWidgetEnabled } from './config.js';

/**
 * Render a row of widgets with alignment
 *
 * @param widgetIds - Widget IDs to render in order
 * @param ctx - Render context
 * @param _align - Row alignment (unused for now, reserved for future)
 * @returns Rendered row string
 */
function renderRow(
  widgetIds: string[],
  ctx: RenderContext,
  _align?: RowAlign
): string {
  const { settings } = ctx;
  const sep = separator(settings.separator);
  const parts: string[] = [];

  for (const widgetId of widgetIds) {
    // Check if widget is enabled
    if (!isWidgetEnabled(settings, widgetId)) {
      continue;
    }

    // Get widget from registry
    const widget = WIDGET_REGISTRY[widgetId];
    if (!widget) continue;

    // Render widget
    const output = widget.render(ctx);
    if (output !== null && output !== '') {
      parts.push(output);
    }
  }

  return parts.join(sep);
}

/**
 * Render the complete status line
 *
 * Iterates through enabled widgets, renders each one, and joins
 * them with separators.
 *
 * @param ctx - Render context with status, usage, and settings
 * @returns Rendered status line string
 */
export function renderStatusLine(ctx: RenderContext): string {
  const { settings } = ctx;

  // If multi-row layout is configured, use it
  if (settings.rows && settings.rows.length > 0) {
    return renderMultiRowStatusLine(ctx);
  }

  // Otherwise use default widget order
  const sep = separator(settings.separator);

  const parts: string[] = [];

  // Render each widget in order
  for (const widget of DEFAULT_WIDGETS) {
    // Check if widget is enabled
    if (!isWidgetEnabled(settings, widget.name)) {
      continue;
    }

    // Render widget
    const output = widget.render(ctx);
    if (output !== null && output !== '') {
      parts.push(output);
    }
  }

  return parts.join(sep);
}

/**
 * Render multi-row status line
 *
 * When rows are configured, renders each row separately.
 * Returns rows joined by newlines.
 *
 * @param ctx - Render context with status, usage, and settings
 * @returns Rendered multi-row status line string
 */
export function renderMultiRowStatusLine(ctx: RenderContext): string {
  const { settings } = ctx;
  const rows = settings.rows || [];

  const renderedRows: string[] = [];

  for (const row of rows) {
    const rendered = renderRow(row.widgets, ctx, row.align);
    if (rendered) {
      renderedRows.push(rendered);
    }
  }

  return renderedRows.join('\n');
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

  // If multi-row layout is configured, render each row
  if (settings.rows && settings.rows.length > 0) {
    const rows: string[] = [];
    for (const row of settings.rows) {
      const rendered = renderRow(row.widgets, ctx, row.align);
      rows.push(rendered);
    }
    return rows;
  }

  // Otherwise return single-row output as array
  return [renderStatusLine(ctx)];
}

/**
 * Render a single widget by name
 *
 * @param name - Widget name
 * @param ctx - Render context
 * @returns Rendered widget string or null
 */
export function renderWidget(
  name: string,
  ctx: RenderContext
): string | null {
  const widget = WIDGET_REGISTRY[name];
  if (!widget) return null;
  return widget.render(ctx);
}

/**
 * Get list of available widget names
 *
 * @returns Array of widget names
 */
export function getWidgetNames(): string[] {
  return Object.keys(WIDGET_REGISTRY);
}
