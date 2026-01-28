/**
 * Usage cache management
 *
 * Caches OAuth usage data to avoid excessive API calls.
 * The cache has a configurable TTL (default 5 minutes).
 */

import { homedir } from 'node:os';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { UsageCache, UsageResponse } from '../types/UsageData.js';
import { getAccessToken, fetchUsage } from './oauth.js';

/** Default cache TTL: 5 minutes */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/** Path to the cache file */
const CACHE_PATH = `${homedir()}/.claude/statusline-usage-cache.json`;

/**
 * Load usage cache from disk
 *
 * @returns Cached usage data or null if not available/expired
 */
export function loadCacheFromDisk(): UsageCache | null {
  try {
    if (existsSync(CACHE_PATH)) {
      const data = readFileSync(CACHE_PATH, 'utf-8');
      return JSON.parse(data) as UsageCache;
    }
  } catch {
    // Silently fail - cache may be corrupted
  }
  return null;
}

/**
 * Save usage cache to disk
 *
 * @param cache - Usage cache data to save
 */
export function saveCacheToDisk(cache: UsageCache): void {
  try {
    const dir = dirname(CACHE_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch {
    // Silently fail - cache is not critical
  }
}

/**
 * Check if cache is still valid
 *
 * @param cache - Cache to check
 * @param ttl - Time-to-live in milliseconds
 * @returns True if cache is valid
 */
export function isCacheValid(
  cache: UsageCache | null,
  ttl: number = DEFAULT_CACHE_TTL
): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < ttl;
}

/**
 * Convert API response to cache format
 *
 * @param response - API response
 * @returns Cache-formatted usage data
 */
function responseToCache(response: UsageResponse): UsageCache {
  return {
    timestamp: Date.now(),
    current_session: {
      reset_time: response.five_hour.resets_at,
      percent_used: response.five_hour.utilization,
    },
    weekly_all: {
      reset_time: response.seven_day.resets_at,
      percent_used: response.seven_day.utilization,
    },
    weekly_sonnet: {
      reset_time: response.seven_day_sonnet.resets_at,
      percent_used: response.seven_day_sonnet.utilization,
    },
  };
}

/**
 * Refresh usage cache from the API
 *
 * @returns Fresh usage cache or null if refresh fails
 */
export async function refreshUsageCache(): Promise<UsageCache | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetchUsage(token);
  if (!response) return null;

  const cache = responseToCache(response);
  saveCacheToDisk(cache);
  return cache;
}

/**
 * Load usage cache with non-blocking refresh
 *
 * This is the main entry point for getting usage data.
 * Strategy:
 * - If valid cache exists: return immediately
 * - If stale cache exists: return stale data, trigger background refresh
 * - If no cache: return null (don't block on first API call)
 *
 * This ensures the statusline renders instantly without waiting for network.
 *
 * @param ttl - Cache TTL in milliseconds (default: 5 minutes)
 * @returns Usage cache or null if unavailable
 */
export async function loadUsageCache(
  ttl: number = DEFAULT_CACHE_TTL
): Promise<UsageCache | null> {
  const cached = loadCacheFromDisk();

  if (isCacheValid(cached, ttl)) {
    // Cache is fresh, return immediately
    return cached;
  }

  if (cached) {
    // Cache is stale but exists - return stale data immediately
    // and trigger background refresh (fire and forget)
    refreshUsageCache().catch(() => {
      // Silently ignore refresh errors
    });
    return cached;
  }

  // No cache at all - trigger background refresh but don't wait
  // User will see usage on next statusline render after cache is populated
  refreshUsageCache().catch(() => {
    // Silently ignore refresh errors
  });
  return null;
}

/**
 * Format reset time as absolute day + time
 *
 * @param isoTime - ISO 8601 timestamp
 * @returns Formatted time like "Wed 11:59" or "now" if already passed
 */
export function formatResetTime(isoTime: string): string {
  const resetDate = new Date(isoTime);
  const now = new Date();

  if (resetDate.getTime() <= now.getTime()) return 'now';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[resetDate.getDay()];
  const hours = String(resetDate.getHours()).padStart(2, '0');
  const mins = String(resetDate.getMinutes()).padStart(2, '0');

  return `${day} ${hours}:${mins}`;
}
