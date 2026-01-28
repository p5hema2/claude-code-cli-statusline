/**
 * ANSI color utilities for terminal output
 *
 * Provides color-coded usage bars and text formatting for the statusline.
 */

import chalk from 'chalk';

/**
 * Create a visual usage bar with color coding based on percentage
 *
 * The bar uses 10 characters to represent 0-100%, with colors:
 * - Green (0-49%): Safe usage
 * - Yellow (50-79%): Moderate usage
 * - Red (80-100%): High usage
 *
 * @param percent - Usage percentage (0-100)
 * @returns Formatted string like "[██████░░░░  60%]"
 */
export function createUsageBar(percent: number): string {
  const pctInt = Math.floor(Math.max(0, Math.min(100, percent)));
  const filled = Math.min(10, Math.max(0, Math.ceil(pctInt / 10)));
  const empty = 10 - filled;

  // Color based on percentage thresholds
  const colorFn =
    pctInt < 50 ? chalk.green : pctInt < 80 ? chalk.yellow : chalk.red;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const pctStr = String(pctInt).padStart(3);

  return colorFn(`[${bar} ${pctStr}%]`);
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

/**
 * Create a separator character
 *
 * @param char - Separator character (default: |)
 * @returns Dimmed separator string
 */
export function separator(char = '|'): string {
  return chalk.dim(` ${char} `);
}
