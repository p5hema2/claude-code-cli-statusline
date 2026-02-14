/**
 * Widget configuration helpers
 *
 * Utility functions for working with widget configuration.
 */

import type { WidgetConfig, ColorValue } from '../../types/index.js';
import { colorize as colorizeUtil } from '../../utils/index.js';

/**
 * Get color from inline widget config
 *
 * @param config - Inline widget configuration
 * @param state - Optional state key for state-based colors
 * @returns Color value or undefined
 */
export function getColor(
  config: WidgetConfig | undefined,
  state?: string
): ColorValue | undefined {
  if (!config) return undefined;

  // Check state-based colors first
  if (state && config.colors?.[state]) {
    return config.colors[state];
  }

  // Fall back to simple color
  return config.color;
}

/**
 * Get option value from inline config
 *
 * @param config - Inline widget configuration
 * @param key - Option key
 * @returns Option value or undefined
 */
export function getOption<T>(
  config: WidgetConfig | undefined,
  key: string
): T | undefined {
  return config?.options?.[key] as T | undefined;
}

/**
 * Apply color to text with optional fallback
 *
 * Convenience wrapper around colorize that works with inline config.
 *
 * @param text - Text to colorize
 * @param config - Inline widget configuration
 * @param state - Optional state key for state-based colors
 * @param fallbackColor - Fallback color if none configured
 * @returns Colored string
 */
export function colorizeWithConfig(
  text: string,
  config: WidgetConfig | undefined,
  state?: string,
  fallbackColor?: ColorValue
): string {
  const color = getColor(config, state) ?? fallbackColor;
  return colorizeUtil(text, color);
}

/**
 * Render widget content with optional label prefix
 *
 * @param content - Colored widget content (already colorized)
 * @param config - Inline widget configuration
 * @param defaultLabelColor - Default color for label if not specified
 * @returns Content with optional label prefix: "Label: content" or just "content"
 */
export function renderWithLabel(
  content: string,
  config: WidgetConfig | undefined,
  defaultLabelColor: ColorValue = 'dim'
): string {
  const label = getOption<string>(config, 'label');

  // No label configured - return content as-is
  if (!label) {
    return content;
  }

  // Get label color (or use default)
  const labelColor = getOption<ColorValue>(config, 'labelColor') ?? defaultLabelColor;

  // Format: "Label: content" (separator included in colorized label)
  return `${colorizeUtil(label + ':', labelColor)} ${content}`;
}

/**
 * N/A visibility options for widgets when content is unavailable
 */
export type NaVisibility = 'hide' | 'na' | 'dash' | 'empty';

/**
 * Render widget with N/A handling and optional label
 *
 * Handles the complete widget rendering flow:
 * 1. If content is null, check naVisibility option
 * 2. Apply colorization to content or placeholder
 * 3. Apply optional label prefix
 *
 * @param content - Widget content (null if unavailable)
 * @param config - Inline widget configuration
 * @param defaultColor - Default color for content
 * @param defaultLabelColor - Default color for label
 * @returns Rendered widget string or null (if naVisibility='hide')
 */
export function renderWidgetWithLabel(
  content: string | null,
  config: WidgetConfig | undefined,
  defaultColor?: ColorValue,
  defaultLabelColor: ColorValue = 'dim'
): string | null {
  // Handle null content based on naVisibility option
  if (content === null) {
    const naVisibility = getOption<NaVisibility>(config, 'naVisibility') ?? 'hide';

    if (naVisibility === 'hide') {
      return null; // Hide entire widget
    }

    // Determine placeholder
    const placeholder = naVisibility === 'na' ? 'N/A' :
                       naVisibility === 'dash' ? '-' :
                       ''; // empty

    // Colorize placeholder (dim color for N/A indicators)
    const colored = colorizeUtil(placeholder, defaultColor ?? 'dim');
    return renderWithLabel(colored, config, defaultLabelColor);
  }

  // Normal rendering: colorize content and add label
  return renderWithLabel(content, config, defaultLabelColor);
}
