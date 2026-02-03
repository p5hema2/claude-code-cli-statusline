/**
 * User settings types
 *
 * Configuration options for customizing the statusline appearance and behavior.
 *
 * The new simplified structure uses inline widget configuration:
 * - Each widget instance in a row has its own config (color, colors, options)
 * - No global widget configuration section
 * - Separator is now a widget, not a global setting
 */

import type { ColorValue } from './colors.type.js';

/**
 * Inline widget configuration
 *
 * Each widget instance in a row can have its own configuration.
 * This replaces the old global widget configuration approach.
 *
 * @example
 * { widget: 'directory', color: 'blue' }
 * { widget: 'separator', options: { text: '|' }, color: 'dim' }
 * { widget: 'gitBranch', colors: { clean: 'green', dirty: 'yellow' } }
 */
export interface WidgetConfig {
  /** Widget ID (e.g., 'directory', 'text', 'separator') */
  widget: string;
  /** Content color (for simple widgets) */
  color?: ColorValue;
  /** State-based colors (for widgets with multiple states like git, vim) */
  colors?: Record<string, ColorValue>;
  /** Widget-specific options */
  options?: Record<string, unknown>;
}

/**
 * User settings for the statusline
 *
 * Simplified structure with only essential configuration.
 * Default settings are loaded from src/defaults/statusline.json.
 */
export interface Settings {
  /** Cache TTL in milliseconds (default: 60000 = 1 minute) */
  cacheTtl?: number;
  /**
   * Multi-row layout configuration
   *
   * Each row is an array of WidgetConfig objects.
   * The order determines display order (left to right).
   *
   * @example
   * rows: [
   *   [
   *     { widget: 'directory', color: 'blue' },
   *     { widget: 'separator' },
   *     { widget: 'gitBranch' }
   *   ],
   *   [
   *     { widget: 'contextUsage' },
   *     { widget: 'separator' },
   *     { widget: 'sessionUsage' }
   *   ]
   * ]
   */
  rows?: WidgetConfig[][];
}
