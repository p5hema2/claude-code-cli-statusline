/**
 * Utility exports
 */

export {
  createUsageBar,
  createCompactUsage,
  colorLabel,
  colorize,
} from './colors.util.js';

export { getAccessToken, fetchUsage } from './oauth.util.js';

export {
  loadCacheFromDisk,
  saveCacheToDisk,
  isCacheValid,
  refreshUsageCache,
  loadUsageCache,
  formatResetTime,
  waitForPendingRefresh,
} from './cache.util.js';

export {
  isGitRepo,
  getBranchName,
  getGitStatus,
  getAheadBehind,
  getGitInfo,
  formatGitIndicators,
} from './git.util.js';
export type { GitInfo } from './git.util.js';

export {
  loadSettings,
  saveSettings,
  getSettingsPath,
  getDefaultSettings,
} from './config.util.js';

export { renderStatusLine, renderStatusLineRows, renderWidget, getWidgetNames } from './renderer.util.js';

export { stripAnsi } from './ansi.util.js';
