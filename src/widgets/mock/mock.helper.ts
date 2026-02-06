/**
 * Mock data helpers for widget preview states
 *
 * Small utility functions that widget schemas call to generate
 * realistic preview data. These replace the centralized fixture
 * generators, keeping mock data co-located with each widget's schema.
 */

import type { CachedUsageEntry } from '../../types/index.js';

/**
 * Generate an ISO reset time ~7 days from now
 *
 * Used by usage widgets to show a realistic "resets at" timestamp
 * in the preview.
 */
export function mockResetTime(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Create a mock cached usage entry with the given utilization
 *
 * @param percentUsed - Usage percentage (0-100)
 * @returns A CachedUsageEntry with reset_time ~7 days out
 */
export function mockCachedEntry(percentUsed: number): CachedUsageEntry {
  return {
    reset_time: mockResetTime(),
    percent_used: percentUsed,
  };
}

/**
 * Generate a Unix ms timestamp for today at the specified time
 *
 * Returns a timestamp anchored to today's date so the preview
 * shows realistic absolute times (e.g., "@ 14:15") regardless
 * of when the GUI is opened.
 *
 * @param hours - Hour of day (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Unix timestamp in milliseconds
 */
export function mockTimestampAt(hours: number, minutes: number): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000;
}
