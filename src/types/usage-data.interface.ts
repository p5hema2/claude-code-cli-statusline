/**
 * OAuth usage data types
 *
 * These types represent the usage limits and cache structure
 * for tracking Claude Code OAuth API consumption.
 */

/** Individual usage limit from the OAuth API */
export interface UsageLimit {
  /** Current utilization as a percentage (0-100) */
  utilization: number;
  /** ISO 8601 timestamp when the limit resets */
  resets_at: string;
}

/** Extra usage credits for Max subscribers who exceed included limits */
export interface ExtraUsage {
  /** Whether extra usage credits are enabled for this account */
  is_enabled: boolean;
  /** Monthly credit limit in USD (null if disabled) */
  monthly_limit: number | null;
  /** Credits used this month in USD (null if disabled) */
  used_credits: number | null;
  /** Utilization percentage (null if disabled) */
  utilization: number | null;
}

/** Response structure from the OAuth usage API */
export interface UsageResponse {
  /** 5-hour rolling session limit */
  five_hour: UsageLimit;
  /** 7-day limit across all models */
  seven_day: UsageLimit;
  /** 7-day limit specifically for Sonnet model */
  seven_day_sonnet: UsageLimit;
  /** Extra usage credits for overuse tracking */
  extra_usage: ExtraUsage;
}

/** Individual cached usage entry */
export interface CachedUsageEntry {
  /** ISO 8601 timestamp when this limit resets */
  reset_time: string;
  /** Percentage of limit used (0-100) */
  percent_used: number;
}

/** Cached extra usage data */
export interface CachedExtraUsage {
  /** Whether extra usage is enabled */
  is_enabled: boolean;
  /** Monthly credit limit in USD (null if disabled) */
  monthly_limit: number | null;
  /** Credits used in USD (null if disabled) */
  used_credits: number | null;
  /** Utilization percentage (null if disabled) */
  utilization: number | null;
}

/** Cached usage data structure stored on disk */
export interface UsageCache {
  /** Unix timestamp (ms) when cache was last updated */
  timestamp: number;
  /** 5-hour session usage */
  current_session: CachedUsageEntry;
  /** 7-day all models usage */
  weekly_all: CachedUsageEntry;
  /** 7-day Sonnet-specific usage */
  weekly_sonnet: CachedUsageEntry;
  /** Extra usage credits tracking */
  extra_usage: CachedExtraUsage;
}
