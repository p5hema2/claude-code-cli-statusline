/**
 * Git branch widget
 *
 * Displays the current git branch with configurable status indicators:
 * - * for dirty (uncommitted changes)
 * - + for staged changes
 * - ? for untracked files
 * - ↑N for commits ahead of remote
 * - ↓N for commits behind remote
 *
 * Supports customizable colors for different git states and custom symbols.
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';
import type { GitBranchOptions, GitBranchSymbols } from '../types/WidgetOptions.js';
import type { ColorValue } from '../types/Colors.js';
import type { GitInfo } from '../utils/git.js';
import { getGitInfo } from '../utils/git.js';
import { getWidgetConfig, formatLabel } from './helpers.js';
import { colorize } from '../utils/colors.js';

/** Default symbols for git status indicators */
const DEFAULT_SYMBOLS: Required<GitBranchSymbols> = {
  dirty: '*',
  staged: '+',
  untracked: '?',
  ahead: '↑',
  behind: '↓',
};

/**
 * Format git status indicators with custom symbols
 */
function formatIndicators(info: GitInfo, symbols?: GitBranchSymbols): string {
  const s = { ...DEFAULT_SYMBOLS, ...symbols };
  let indicators = '';
  if (info.isDirty) indicators += s.dirty;
  if (info.hasStaged) indicators += s.staged;
  if (info.hasUntracked) indicators += s.untracked;
  if (info.ahead > 0) indicators += `${s.ahead}${info.ahead}`;
  if (info.behind > 0) indicators += `${s.behind}${info.behind}`;
  return indicators;
}

/**
 * Determine the appropriate color for the branch based on git state
 */
function getBranchColor(info: GitInfo, options?: GitBranchOptions): ColorValue {
  const colors = options?.colors;

  // Check for detached HEAD (branch name wrapped in parentheses)
  if (info.branch.startsWith('(')) {
    return colors?.detached ?? 'yellow';
  }

  // Priority: behind > ahead > dirty/staged > clean
  if (info.behind > 0) {
    return colors?.behind ?? 'red';
  }
  if (info.ahead > 0) {
    return colors?.ahead ?? 'cyan';
  }
  if (info.isDirty || info.hasStaged) {
    return colors?.dirty ?? 'yellow';
  }
  return colors?.clean ?? 'green';
}

export const GitBranchWidget: Widget = {
  name: 'gitBranch',
  label: 'Git',

  render(ctx: RenderContext): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) return null;

    // Use mock git info if available (preview mode), otherwise get real git info
    const gitInfo = ctx.mockGitInfo !== undefined ? ctx.mockGitInfo : getGitInfo(dir);
    if (!gitInfo) return null;

    const config = getWidgetConfig(ctx, 'gitBranch');
    const options = config?.options as GitBranchOptions | undefined;

    const label = formatLabel(config, '');
    const indicators = formatIndicators(gitInfo, options?.symbols);
    const branch = gitInfo.branch;

    // Get branch color based on state
    const branchColor = getBranchColor(gitInfo, options);
    const branchStr = colorize(branch, branchColor);

    // Color indicators (default red, or use indicatorColor from options)
    const indicatorStr = indicators
      ? colorize(indicators, options?.indicatorColor, chalk.red)
      : '';

    // Leading space for visual separation (only if no label)
    const prefix = label ? '' : ' ';
    return label + prefix + branchStr + indicatorStr;
  },
};
