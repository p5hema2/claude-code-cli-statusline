/**
 * Git branch widget
 *
 * Displays the current git branch with status indicators:
 * - * for dirty (uncommitted changes)
 * - + for staged changes
 * - ? for untracked files
 * - ↑N for commits ahead of remote
 * - ↓N for commits behind remote
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';
import { getGitInfo, formatGitIndicators } from '../utils/git.js';

export const GitBranchWidget: Widget = {
  name: 'gitBranch',
  label: 'Git',

  render(ctx: RenderContext): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) return null;

    // Use mock git info if available (preview mode), otherwise get real git info
    const gitInfo = ctx.mockGitInfo !== undefined ? ctx.mockGitInfo : getGitInfo(dir);
    if (!gitInfo) return null;

    const indicators = formatGitIndicators(gitInfo);
    const branch = gitInfo.branch;

    // Color the branch name based on status
    const branchColor =
      gitInfo.isDirty || gitInfo.hasStaged
        ? chalk.yellow
        : chalk.green;

    const indicatorStr = indicators ? chalk.red(indicators) : '';
    return ` ${branchColor(branch)}${indicatorStr}`;
  },
};
