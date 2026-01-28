/**
 * Status line renderer
 *
 * Assembles widgets into a complete status line output.
 */

import type { RenderContext } from '../types/Widget.js';
import { DEFAULT_WIDGETS, WIDGET_REGISTRY } from '../widgets/index.js';
import { separator } from './colors.js';
import { isWidgetEnabled } from './config.js';

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
