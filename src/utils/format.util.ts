/**
 * Formatting utilities for display values
 */

/**
 * Format a token count into a human-readable compact string
 *
 * @param n - Token count
 * @returns Formatted string (e.g., "15.2k", "1.5M", "500")
 */
export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
