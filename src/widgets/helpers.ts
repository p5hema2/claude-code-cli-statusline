/**
 * Widget configuration helpers
 *
 * Utility functions for accessing widget configuration from render context.
 */

import type { RenderContext } from './Widget.js';
import type { WidgetConfig } from '../types/Settings.js';
import { colorize } from '../utils/colors.js';

/**
 * Get widget configuration from render context
 *
 * @param ctx - Render context containing settings
 * @param name - Widget name to look up
 * @returns Widget configuration or undefined if not found
 */
export function getWidgetConfig(
  ctx: RenderContext,
  name: string
): WidgetConfig | undefined {
  return ctx.settings?.widgets?.[name];
}

/**
 * Format a widget label with optional color
 *
 * Handles label customization:
 * - config.label undefined → use defaultLabel with colon
 * - config.label = '' (empty string) → no label
 * - config.label = 'custom' → use 'custom' as-is (no auto-colon)
 *
 * @param config - Widget configuration (may be undefined)
 * @param defaultLabel - Default label text (without colon)
 * @returns Formatted and colorized label string
 */
export function formatLabel(
  config: WidgetConfig | undefined,
  defaultLabel: string
): string {
  // Determine label text
  let labelText: string;
  if (config?.label !== undefined) {
    // User specified a label (could be empty string for no label)
    labelText = config.label;
  } else {
    // Use default label with colon
    labelText = defaultLabel ? `${defaultLabel}:` : '';
  }

  // Return empty string for no label
  if (!labelText) {
    return '';
  }

  // Colorize the label (default to dim if no color specified)
  return colorize(labelText, config?.labelColor, (t) => t);
}
