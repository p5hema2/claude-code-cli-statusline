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

/**
 * Format a duration in milliseconds to a human-readable string
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2hr 15m", "45m", "<1m")
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return '<1m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}m`;
}

/**
 * Format a USD cost value
 *
 * @param usd - Cost in US dollars
 * @returns Formatted string (e.g., "$0.01", "$1.23", "$12.50")
 */
export function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
