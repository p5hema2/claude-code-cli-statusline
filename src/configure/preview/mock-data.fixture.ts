/**
 * Mock data generators for the configuration preview
 *
 * Generates realistic-looking test data for widgets based on
 * the selected preview states from the N/A toggles.
 */

import type { StatusJSON , UsageCache, CachedUsageEntry } from '../../types/index.js';
import type { GitInfo } from '../../utils/index.js';

/** Widget state overrides for preview */
export type WidgetStates = Record<string, string>;

/** Default widget states */
export const DEFAULT_WIDGET_STATES: WidgetStates = {
  directory: 'short',
  gitBranch: 'clean',
  model: 'sonnet',
  outputStyle: 'concise',
  contextUsage: 'low',
  sessionUsage: 'low',
  weeklyUsage: 'low',
  weeklySonnet: 'low',
  usageAge: 'afternoon',
  vimMode: 'normal',
};

/**
 * Generate mock StatusJSON based on widget states
 */
export function generateMockStatus(states: WidgetStates): StatusJSON {
  const status: StatusJSON = {};

  // Directory - always set a path for preview
  status.current_dir =
    states.directory === 'long'
      ? '/home/user/projects/my-awesome-app/src/components'
      : '~/my-project';

  // Model
  const modelMap: Record<string, { id: string; display_name: string }> = {
    sonnet: { id: 'claude-sonnet-4-20250514', display_name: 'Claude 4 Sonnet' },
    opus: { id: 'claude-opus-4-20250514', display_name: 'Claude 4 Opus' },
    haiku: { id: 'claude-haiku-3-20240307', display_name: 'Claude 3 Haiku' },
  };
  status.model = modelMap[states.model] || modelMap.sonnet;

  // Context window usage
  const contextMap: Record<string, number | undefined> = {
    low: 80, // 20% used = 80% remaining
    medium: 50, // 50% used = 50% remaining
    high: 20, // 80% used = 20% remaining
    unavailable: undefined,
  };
  const remaining = contextMap[states.contextUsage];
  if (remaining !== undefined) {
    status.context_window = { remaining_percentage: remaining };
  }

  // Output style
  const styleMap: Record<string, string> = {
    concise: 'concise',
    verbose: 'verbose',
    explanatory: 'explanatory',
  };
  status.output_style = { name: styleMap[states.outputStyle] || 'concise' };

  // Vim mode
  if (states.vimMode !== 'disabled') {
    status.vim_mode = { mode: states.vimMode || 'normal' };
  }

  return status;
}

/**
 * Create a mock cached usage entry
 */
function createCachedEntry(percentUsed: number): CachedUsageEntry {
  const resetTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    reset_time: resetTime,
    percent_used: percentUsed,
  };
}

/**
 * Calculate mock timestamp based on usageAge state
 *
 * Returns a timestamp for today at the specified time of day,
 * so the preview shows realistic absolute times.
 */
function getMockTimestamp(usageAgeState: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Time-of-day presets (hours, minutes)
  const timeMap: Record<string, [number, number]> = {
    morning: [9, 30], // 09:30
    afternoon: [14, 15], // 14:15
    evening: [19, 45], // 19:45
  };

  const time = timeMap[usageAgeState] ?? [14, 15]; // Default to afternoon
  return today.getTime() + time[0] * 60 * 60 * 1000 + time[1] * 60 * 1000;
}

/**
 * Generate mock UsageCache based on widget states
 */
export function generateMockUsage(states: WidgetStates): UsageCache | null {
  // If all usage widgets are set to "noOAuth", return null
  if (
    states.sessionUsage === 'noOAuth' &&
    states.weeklyUsage === 'noOAuth' &&
    states.weeklySonnet === 'noOAuth' &&
    states.usageAge === 'noOAuth'
  ) {
    return null;
  }

  const percentMap: Record<string, number> = {
    low: 20,
    medium: 50,
    high: 80,
  };

  // Default values
  const sessionPercent = states.sessionUsage === 'noOAuth' ? 0 : (percentMap[states.sessionUsage] || 20);
  const weeklyPercent = states.weeklyUsage === 'noOAuth' ? 0 : (percentMap[states.weeklyUsage] || 20);
  const sonnetPercent = states.weeklySonnet === 'noOAuth' ? 0 : (percentMap[states.weeklySonnet] || 20);

  return {
    timestamp: getMockTimestamp(states.usageAge || '5min'),
    current_session: createCachedEntry(sessionPercent),
    weekly_all: createCachedEntry(weeklyPercent),
    weekly_sonnet: createCachedEntry(sonnetPercent),
  };
}

/**
 * Get mock git info for the preview
 *
 * Handles all preview states for the gitBranch widget:
 * - clean: No indicators
 * - dirty: Uncommitted changes only
 * - staged: Staged changes only
 * - untracked: Untracked files only
 * - ahead: Local commits not pushed
 * - behind: Remote commits not pulled
 * - diverged: Both ahead and behind
 * - mixed: Dirty + staged + untracked
 * - working: All indicators active
 * - detached: Detached HEAD state
 * - notRepo: Not a git repository
 *
 * @param states - Widget states from UI toggles
 * @returns GitInfo for preview, or null if git should be hidden
 */
export function getMockGitInfo(states: WidgetStates): GitInfo | null {
  const state = states.gitBranch || 'clean';

  if (state === 'notRepo') {
    return null;
  }

  // Base git info (clean state)
  const info: GitInfo = {
    branch: state === 'detached' ? '(HEAD detached at abc1234)' : 'main',
    isDirty: false,
    hasStaged: false,
    hasUntracked: false,
    ahead: 0,
    behind: 0,
  };

  // Apply state-specific flags
  switch (state) {
    case 'dirty':
      info.isDirty = true;
      break;
    case 'staged':
      info.hasStaged = true;
      break;
    case 'untracked':
      info.hasUntracked = true;
      break;
    case 'ahead':
      info.ahead = 3;
      break;
    case 'behind':
      info.behind = 2;
      break;
    case 'diverged':
      info.ahead = 3;
      info.behind = 2;
      break;
    case 'mixed':
      info.isDirty = true;
      info.hasStaged = true;
      info.hasUntracked = true;
      break;
    case 'working':
      info.isDirty = true;
      info.hasStaged = true;
      info.hasUntracked = true;
      info.ahead = 3;
      info.behind = 2;
      break;
    case 'detached':
      // Branch already set above
      break;
    case 'clean':
    default:
      // All flags already false
      break;
  }

  return info;
}
