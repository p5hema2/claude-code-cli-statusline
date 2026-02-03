/**
 * ANSI color utilities for terminal output
 *
 * Provides color-coded usage bars and text formatting for the statusline.
 */

import chalk, { type ChalkInstance } from 'chalk';

import type { ColorValue, UsageBarColors } from '../types/index.js';

/**
 * Get a chalk function for a ColorValue
 *
 * Maps ColorValue strings to their corresponding chalk methods.
 * Returns identity function if color is undefined or invalid.
 *
 * @param color - ColorValue to convert to chalk function
 * @returns Chalk function for the specified color
 */
export function getChalkColor(color: ColorValue | undefined): ChalkInstance {
  if (!color) return chalk;
  // All ColorValue strings are valid chalk method names
  const chalkMethod = chalk[color as keyof typeof chalk];
  if (typeof chalkMethod === 'function') {
    return chalkMethod as ChalkInstance;
  }
  return chalk;
}

/**
 * Apply color to text with optional fallback
 *
 * @param text - Text to colorize
 * @param color - ColorValue to apply (undefined = use fallback)
 * @param fallback - Fallback chalk function if color is undefined
 * @returns Colored string
 */
export function colorize(
  text: string,
  color?: ColorValue,
  fallback?: (text: string) => string
): string {
  if (color) {
    return getChalkColor(color)(text);
  }
  if (fallback) {
    return fallback(text);
  }
  return text;
}

/** Options for createUsageBar */
export interface UsageBarOptions {
  /** Custom colors for each threshold */
  colors?: UsageBarColors;
  /** Whether to show the bar (default: true) */
  showBar?: boolean;
  /** Whether to show the percentage (default: true) */
  showPercent?: boolean;
}

/**
 * Create a visual usage bar with color coding based on percentage
 *
 * The bar uses 10 characters to represent 0-100%, with colors:
 * - Green (0-49%): Safe usage
 * - Yellow (50-79%): Moderate usage
 * - Red (80-100%): High usage
 *
 * @param percent - Usage percentage (0-100)
 * @param options - Bar display options (colors, showBar, showPercent)
 * @returns Formatted string like "[██████░░░░  60%]"
 */
export function createUsageBar(
  percent: number,
  options?: UsageBarOptions | UsageBarColors
): string {
  // Support both old (UsageBarColors) and new (UsageBarOptions) signatures
  const opts: UsageBarOptions =
    options && ('showBar' in options || 'showPercent' in options || 'colors' in options)
      ? options as UsageBarOptions
      : { colors: options as UsageBarColors | undefined };

  const showBar = opts.showBar !== false;
  const showPercent = opts.showPercent !== false;
  const colors = opts.colors;

  // If both are hidden, return empty string
  if (!showBar && !showPercent) {
    return '';
  }

  const pctInt = Math.floor(Math.max(0, Math.min(100, percent)));

  // Get colors with defaults
  const lowColor = colors?.low ?? 'green';
  const mediumColor = colors?.medium ?? 'yellow';
  const highColor = colors?.high ?? 'red';

  // Select color based on percentage thresholds
  const selectedColor =
    pctInt < 50 ? lowColor : pctInt < 80 ? mediumColor : highColor;

  const colorFn = getChalkColor(selectedColor);

  // Build the output based on options
  if (showBar && showPercent) {
    const filled = Math.min(10, Math.max(0, Math.ceil(pctInt / 10)));
    const empty = 10 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const pctStr = String(pctInt).padStart(3);
    return colorFn(`[${bar} ${pctStr}%]`);
  } else if (showBar) {
    const filled = Math.min(10, Math.max(0, Math.ceil(pctInt / 10)));
    const empty = 10 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return colorFn(`[${bar}]`);
  } else {
    // showPercent only
    return colorFn(`[${pctInt}%]`);
  }
}

/**
 * Create a compact usage indicator for minimal space
 *
 * @param percent - Usage percentage (0-100)
 * @returns Formatted string like "60%"
 */
export function createCompactUsage(percent: number): string {
  const pctInt = Math.floor(Math.max(0, Math.min(100, percent)));
  const colorFn =
    pctInt < 50 ? chalk.green : pctInt < 80 ? chalk.yellow : chalk.red;
  return colorFn(`${pctInt}%`);
}

/**
 * Format a label with a specific color
 *
 * @param label - Text to format
 * @param color - Color name or hex code
 * @returns Colored string
 */
export function colorLabel(
  label: string,
  color: 'dim' | 'cyan' | 'magenta' | 'blue' | 'yellow' | 'green' | 'red'
): string {
  return chalk[color](label);
}

