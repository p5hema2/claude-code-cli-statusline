/**
 * Utility exports
 */

export {
  createUsageBar,
  createCompactUsage,
  colorLabel,
  separator,
} from './colors.js';

export { getAccessToken, fetchUsage } from './oauth.js';

export {
  loadCacheFromDisk,
  saveCacheToDisk,
  isCacheValid,
  refreshUsageCache,
  loadUsageCache,
  formatResetTime,
} from './cache.js';

export {
  isGitRepo,
  getBranchName,
  getGitStatus,
  getAheadBehind,
  getGitInfo,
  formatGitIndicators,
  type GitInfo,
} from './git.js';

export { loadSettings, isWidgetEnabled } from './config.js';

export { renderStatusLine, renderWidget, getWidgetNames } from './renderer.js';
