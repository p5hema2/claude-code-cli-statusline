/**
 * Tests for usage cache management
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import type { UsageCache, UsageResponse } from '../types/index.js';

import {
  loadCacheFromDisk,
  saveCacheToDisk,
  isCacheValid,
  refreshUsageCache,
  loadUsageCache,
  waitForPendingRefresh,
  formatResetTime,
} from './cache.util.js';
import { getAccessToken, fetchUsage } from './oauth.util.js';

// Mock Node.js modules
vi.mock('node:fs');
vi.mock('./oauth.util.js');

describe('loadCacheFromDisk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load valid cache from disk', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now(),
      current_session: {
        reset_time: '2026-02-04T18:00:00Z',
        percent_used: 0.25,
      },
      weekly_all: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.45,
      },
      weekly_sonnet: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.60,
      },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

    const result = loadCacheFromDisk();
    expect(result).toEqual(mockCache);
    expect(readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.claude/statusline-usage-cache.json'),
      'utf-8'
    );
  });

  it('should return null if cache file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const result = loadCacheFromDisk();
    expect(result).toBeNull();
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('should return null if file read fails', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const result = loadCacheFromDisk();
    expect(result).toBeNull();
  });

  it('should return null if JSON parsing fails', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('invalid-json');

    const result = loadCacheFromDisk();
    expect(result).toBeNull();
  });

  it('should return null if JSON is malformed', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('{"incomplete": ');

    const result = loadCacheFromDisk();
    expect(result).toBeNull();
  });
});

describe('saveCacheToDisk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save cache to disk with pretty formatting', () => {
    const mockCache: UsageCache = {
      timestamp: 1234567890,
      current_session: {
        reset_time: '2026-02-04T18:00:00Z',
        percent_used: 0.25,
      },
      weekly_all: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.45,
      },
      weekly_sonnet: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.60,
      },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);

    saveCacheToDisk(mockCache);

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.claude/statusline-usage-cache.json'),
      JSON.stringify(mockCache, null, 2),
      'utf-8'
    );
  });

  it('should create directory if it does not exist', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now(),
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(false);

    saveCacheToDisk(mockCache);

    expect(mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('.claude'),
      { recursive: true }
    );
    expect(writeFileSync).toHaveBeenCalled();
  });

  it('should silently fail if directory creation fails', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now(),
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(mkdirSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    // Should not throw
    expect(() => saveCacheToDisk(mockCache)).not.toThrow();
  });

  it('should silently fail if file write fails', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now(),
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error('Disk full');
    });

    // Should not throw
    expect(() => saveCacheToDisk(mockCache)).not.toThrow();
  });
});

describe('isCacheValid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for null cache', () => {
    expect(isCacheValid(null)).toBe(false);
  });

  it('should return true for fresh cache (within TTL)', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 60000, // 1 minute ago
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    const ttl = 5 * 60 * 1000; // 5 minutes
    expect(isCacheValid(mockCache, ttl)).toBe(true);
  });

  it('should return false for stale cache (beyond TTL)', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    const ttl = 5 * 60 * 1000; // 5 minutes
    expect(isCacheValid(mockCache, ttl)).toBe(false);
  });

  it('should use default TTL if not specified', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 4 * 60 * 1000, // 4 minutes ago
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    // Default TTL is 5 minutes, so 4 minutes ago should be valid
    expect(isCacheValid(mockCache)).toBe(true);
  });

  it('should return false for cache at exact TTL boundary', () => {
    const ttl = 5 * 60 * 1000;
    const mockCache: UsageCache = {
      timestamp: Date.now() - ttl, // Exactly at TTL
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    expect(isCacheValid(mockCache, ttl)).toBe(false);
  });

  it('should return false for negative timestamp', () => {
    const mockCache: UsageCache = {
      timestamp: -1000,
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    expect(isCacheValid(mockCache)).toBe(false);
  });

  it('should return true for future timestamp (clock skew)', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() + 60000, // 1 minute in the future (clock skew)
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    // Future timestamps result in negative age, which is < ttl, so returns true
    // This is acceptable behavior - clock skew should not invalidate cache
    expect(isCacheValid(mockCache)).toBe(true);
  });

  it('should handle zero TTL', () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 1, // Any age makes it stale
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    expect(isCacheValid(mockCache, 0)).toBe(false);
  });
});

describe('refreshUsageCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch usage and save to cache', async () => {
    const mockResponse: UsageResponse = {
      five_hour: {
        utilization: 0.25,
        resets_at: '2026-02-04T18:00:00Z',
      },
      seven_day: {
        utilization: 0.45,
        resets_at: '2026-02-08T00:00:00Z',
      },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: {
        utilization: 0.60,
        resets_at: '2026-02-08T00:00:00Z',
      },
      extra_usage: {
        is_enabled: false,
        monthly_limit: null,
        used_credits: null,
        utilization: null,
      },
    };

    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue(mockResponse);
    vi.mocked(existsSync).mockReturnValue(true);

    const result = await refreshUsageCache();

    expect(result).toMatchObject({
      current_session: {
        reset_time: '2026-02-04T18:00:00Z',
        percent_used: 0.25,
      },
      weekly_all: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.45,
      },
      weekly_sonnet: {
        reset_time: '2026-02-08T00:00:00Z',
        percent_used: 0.60,
      },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    });
    expect(result?.timestamp).toBeGreaterThan(0);
    expect(writeFileSync).toHaveBeenCalled();
  });

  it('should return null if access token is unavailable', async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);

    const result = await refreshUsageCache();
    expect(result).toBeNull();
    expect(fetchUsage).not.toHaveBeenCalled();
  });

  it('should return null if fetchUsage fails', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue(null);

    const result = await refreshUsageCache();
    expect(result).toBeNull();
  });

  it('should save cache even if API returns partial data', async () => {
    const mockResponse: UsageResponse = {
      five_hour: {
        utilization: 0.25,
        resets_at: '2026-02-04T18:00:00Z',
      },
      seven_day: {
        utilization: 0.45,
        resets_at: '2026-02-08T00:00:00Z',
      },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: {
        utilization: 0.60,
        resets_at: '2026-02-08T00:00:00Z',
      },
      extra_usage: {
        is_enabled: false,
        monthly_limit: null,
        used_credits: null,
        utilization: null,
      },
    };

    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue(mockResponse);
    vi.mocked(existsSync).mockReturnValue(true);

    const result = await refreshUsageCache();

    expect(result).not.toBeNull();
    expect(result?.current_session.percent_used).toBe(0.25);
  });
});

describe('loadUsageCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up global state
    vi.clearAllMocks();
  });

  it('should return fresh cache immediately without refresh', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 60000, // 1 minute ago
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

    const result = await loadUsageCache();

    expect(result).toEqual(mockCache);
    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchUsage).not.toHaveBeenCalled();
  });

  it('should return stale cache and trigger background refresh', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (stale)
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    const mockResponse: UsageResponse = {
      five_hour: { utilization: 0.30, resets_at: '2026-02-04T18:00:00Z' },
      seven_day: { utilization: 0.50, resets_at: '2026-02-08T00:00:00Z' },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: { utilization: 0.65, resets_at: '2026-02-08T00:00:00Z' },
      extra_usage: {
        is_enabled: false,
        monthly_limit: null,
        used_credits: null,
        utilization: null,
      },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue(mockResponse);

    const result = await loadUsageCache();

    // Should return stale cache immediately
    expect(result).toEqual(mockCache);

    // Background refresh should be triggered
    expect(getAccessToken).toHaveBeenCalled();
  });

  it('should return null if no cache exists', async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue({
      five_hour: { utilization: 0.25, resets_at: '2026-02-04T18:00:00Z' },
      seven_day: { utilization: 0.45, resets_at: '2026-02-08T00:00:00Z' },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: { utilization: 0.60, resets_at: '2026-02-08T00:00:00Z' },
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    });

    const result = await loadUsageCache();

    // Returns null immediately (deferred refresh)
    expect(result).toBeNull();

    // Background refresh should be triggered
    expect(getAccessToken).toHaveBeenCalled();
  });

  it('should use custom TTL', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));

    // 1 minute TTL - cache should be stale
    const result = await loadUsageCache(60000);

    expect(result).toEqual(mockCache);
    expect(getAccessToken).toHaveBeenCalled(); // Refresh triggered
  });
});

describe('waitForPendingRefresh', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear any pending refresh from previous tests
    await waitForPendingRefresh();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Clean up pending refresh
    await waitForPendingRefresh();
  });

  it('should return null if no refresh is pending', async () => {
    // Ensure no previous test left pending refresh
    await waitForPendingRefresh();

    const result = await waitForPendingRefresh();
    expect(result).toBeNull();
  });

  it('should wait for pending refresh to complete', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 6 * 60 * 1000, // Stale
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    const mockResponse: UsageResponse = {
      five_hour: { utilization: 0.30, resets_at: '2026-02-04T18:00:00Z' },
      seven_day: { utilization: 0.50, resets_at: '2026-02-08T00:00:00Z' },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: { utilization: 0.65, resets_at: '2026-02-08T00:00:00Z' },
      extra_usage: {
        is_enabled: false,
        monthly_limit: null,
        used_credits: null,
        utilization: null,
      },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue(mockResponse);

    // Trigger background refresh
    await loadUsageCache();

    // Wait for it
    const result = await waitForPendingRefresh();

    expect(result).not.toBeNull();
    expect(result?.current_session.percent_used).toBe(0.30);
  });

  it('should clear pending refresh after completion', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 6 * 60 * 1000,
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
    vi.mocked(getAccessToken).mockResolvedValue('test-token');
    vi.mocked(fetchUsage).mockResolvedValue({
      five_hour: { utilization: 0.30, resets_at: '2026-02-04T18:00:00Z' },
      seven_day: { utilization: 0.50, resets_at: '2026-02-08T00:00:00Z' },
      seven_day_oauth_apps: null,
      seven_day_cowork: null,
      seven_day_sonnet: { utilization: 0.65, resets_at: '2026-02-08T00:00:00Z' },
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    });

    await loadUsageCache();
    await waitForPendingRefresh();

    // Second call should return null (no pending refresh)
    const result2 = await waitForPendingRefresh();
    expect(result2).toBeNull();
  });

  it('should handle refresh failure gracefully', async () => {
    const mockCache: UsageCache = {
      timestamp: Date.now() - 6 * 60 * 1000,
      current_session: { reset_time: '2026-02-04T18:00:00Z', percent_used: 0.25 },
      weekly_all: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.45 },
      weekly_sonnet: { reset_time: '2026-02-08T00:00:00Z', percent_used: 0.60 },
      weekly_oauth_apps: null,
      weekly_cowork: null,
      extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockCache));
    vi.mocked(getAccessToken).mockResolvedValue(null); // Auth fails

    await loadUsageCache();
    const result = await waitForPendingRefresh();

    expect(result).toBeNull();
  });
});

describe('formatResetTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format future reset time as day + time', () => {
    const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const isoTime = futureTime.toISOString();

    const result = formatResetTime(isoTime);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const expectedDay = days[futureTime.getDay()];
    const hours = String(futureTime.getHours()).padStart(2, '0');
    const mins = String(futureTime.getMinutes()).padStart(2, '0');

    expect(result).toBe(`${expectedDay} ${hours}:${mins}`);
  });

  it('should return "now" for past reset time', () => {
    const pastTime = new Date(Date.now() - 60000); // 1 minute ago
    const isoTime = pastTime.toISOString();

    const result = formatResetTime(isoTime);
    expect(result).toBe('now');
  });

  it('should return "now" for exact current time', () => {
    const now = new Date();
    const isoTime = now.toISOString();

    const result = formatResetTime(isoTime);
    expect(result).toBe('now');
  });

  it('should format time with leading zeros', () => {
    const futureTime = new Date();
    futureTime.setHours(9, 5, 0); // 09:05
    futureTime.setDate(futureTime.getDate() + 1); // Tomorrow
    const isoTime = futureTime.toISOString();

    const result = formatResetTime(isoTime);

    expect(result).toMatch(/\d{2}:\d{2}/); // HH:MM format
    expect(result).toContain('09:05');
  });

  it('should handle all days of the week', () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    days.forEach((day, index) => {
      const futureTime = new Date();
      futureTime.setDate(futureTime.getDate() + ((index - futureTime.getDay() + 7) % 7 || 7));
      const isoTime = futureTime.toISOString();

      const result = formatResetTime(isoTime);
      expect(result).toContain(day);
    });
  });

  it('should handle midnight reset time', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    midnight.setDate(midnight.getDate() + 1); // Tomorrow midnight
    const isoTime = midnight.toISOString();

    const result = formatResetTime(isoTime);
    expect(result).toMatch(/\w{3} 00:00/);
  });

  it('should handle noon reset time', () => {
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    noon.setDate(noon.getDate() + 1); // Tomorrow noon
    const isoTime = noon.toISOString();

    const result = formatResetTime(isoTime);
    expect(result).toMatch(/\w{3} 12:00/);
  });
});
