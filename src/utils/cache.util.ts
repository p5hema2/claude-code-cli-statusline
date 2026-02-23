/**
 * Usage cache management
 *
 * Caches OAuth usage data to avoid excessive API calls.
 * The cache has a configurable TTL (default 5 minutes).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname } from 'node:path';

import type { UsageCache, UsageResponse } from '../types/index.js';

import { getAccessToken, fetchUsage } from './oauth.util.js';

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
    current_session: response.five_hour
      ? {
          reset_time: response.five_hour.resets_at,
          percent_used: response.five_hour.utilization,
        }
      : null,
    weekly_all: response.seven_day
      ? {
          reset_time: response.seven_day.resets_at,
          percent_used: response.seven_day.utilization,
        }
      : null,
    weekly_sonnet: response.seven_day_sonnet
      ? {
          reset_time: response.seven_day_sonnet.resets_at,
          percent_used: response.seven_day_sonnet.utilization,
        }
      : null,
    weekly_oauth_apps: response.seven_day_oauth_apps
      ? {
          reset_time: response.seven_day_oauth_apps.resets_at,
          percent_used: response.seven_day_oauth_apps.utilization,
        }
      : null,
    weekly_cowork: response.seven_day_cowork
      ? {
          reset_time: response.seven_day_cowork.resets_at,
          percent_used: response.seven_day_cowork.utilization,
        }
      : null,
    weekly_opus: response.seven_day_opus
      ? {
          reset_time: response.seven_day_opus.resets_at,
          percent_used: response.seven_day_opus.utilization,
        }
      : null,
    extra_usage: {
      is_enabled: response.extra_usage.is_enabled,
      monthly_limit: response.extra_usage.monthly_limit,
      used_credits: response.extra_usage.used_credits,
      utilization: response.extra_usage.utilization,
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

/** Pending refresh promise, if any */
let pendingRefresh: Promise<UsageCache | null> | null = null;

/**
 * Load usage cache with deferred refresh
 *
 * This is the main entry point for getting usage data.
 * Strategy:
 * - If valid cache exists: return immediately
 * - If stale cache exists: return stale data, trigger refresh
 * - If no cache: return null (don't block on first API call)
 *
 * The refresh runs in parallel - call waitForPendingRefresh() after rendering
 * to ensure the refresh completes before process exit.
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
    pendingRefresh = null;
    return cached;
  }

  // Cache is stale or missing - trigger refresh
  // Store the promise so we can await it after rendering
  pendingRefresh = refreshUsageCache().catch(() => null);

  // Return stale cache (or null) immediately for fast rendering
  return cached;
}

/**
 * Wait for any pending cache refresh to complete
 *
 * Call this after rendering to ensure the refresh finishes before process exit.
 * This is non-blocking if no refresh is pending.
 *
 * @returns The refreshed cache or null
 */
export async function waitForPendingRefresh(): Promise<UsageCache | null> {
  if (!pendingRefresh) return null;
  const result = await pendingRefresh;
  pendingRefresh = null;
  return result;
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
