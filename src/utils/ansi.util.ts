/**
 * ANSI escape sequence utilities
 */

/**
 * Strip ANSI escape codes from a string
 *
 * @param ansi - String potentially containing ANSI escape codes
 * @returns Plain text without escape sequences
 */
export function stripAnsi(ansi: string): string {
  return ansi.replace(/\x1b\[[0-9;]*m/g, '');
}
