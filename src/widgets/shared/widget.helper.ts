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
