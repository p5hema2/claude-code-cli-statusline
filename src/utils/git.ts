/**
 * Git operations for statusline
 *
 * Provides git branch and status information for the current directory.
 */

import { execSync } from 'node:child_process';

/** Git status information */
export interface GitInfo {
  /** Current branch name */
  branch: string;
  /** Whether there are uncommitted changes */
  isDirty: boolean;
  /** Whether there are staged changes */
  hasStaged: boolean;
  /** Whether there are untracked files */
  hasUntracked: boolean;
  /** Number of commits ahead of remote */
  ahead: number;
  /** Number of commits behind remote */
  behind: number;
}

/**
 * Check if a directory is inside a git repository
 *
 * @param dir - Directory to check
 * @returns True if inside a git repo
 */
export function isGitRepo(dir: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current git branch name
 *
 * @param dir - Directory to check
 * @returns Branch name or null if not available
 */
export function getBranchName(dir: string): string | null {
  try {
    const result = execSync('git symbolic-ref --short HEAD', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
    return result.trim();
  } catch {
    // May be in detached HEAD state
    try {
      const result = execSync('git rev-parse --short HEAD', {
        cwd: dir,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });
      return `(${result.trim()})`;
    } catch {
      return null;
    }
  }
}

/**
 * Get git status flags
 *
 * @param dir - Directory to check
 * @returns Object with dirty, staged, untracked flags
 */
export function getGitStatus(
  dir: string
): Pick<GitInfo, 'isDirty' | 'hasStaged' | 'hasUntracked'> {
  try {
    const result = execSync('git status --porcelain', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });

    const lines = result.trim().split('\n').filter(Boolean);
    let isDirty = false;
    let hasStaged = false;
    let hasUntracked = false;

    for (const line of lines) {
      const index = line[0];
      const worktree = line[1];

      if (index === '?') {
        hasUntracked = true;
      } else if (index !== ' ' && index !== '?') {
        hasStaged = true;
      }
      if (worktree !== ' ' && worktree !== '?') {
        isDirty = true;
      }
    }

    return { isDirty, hasStaged, hasUntracked };
  } catch {
    return { isDirty: false, hasStaged: false, hasUntracked: false };
  }
}

/**
 * Get ahead/behind count relative to remote
 *
 * @param dir - Directory to check
 * @returns Object with ahead and behind counts
 */
export function getAheadBehind(dir: string): Pick<GitInfo, 'ahead' | 'behind'> {
  try {
    const result = execSync('git rev-list --left-right --count HEAD...@{u}', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });

    const [ahead, behind] = result.trim().split('\t').map(Number);
    return { ahead: ahead || 0, behind: behind || 0 };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}

/**
 * Get comprehensive git information for a directory
 *
 * @param dir - Directory to check
 * @returns Git info or null if not a git repo
 */
export function getGitInfo(dir: string): GitInfo | null {
  if (!isGitRepo(dir)) return null;

  const branch = getBranchName(dir);
  if (!branch) return null;

  const status = getGitStatus(dir);
  const aheadBehind = getAheadBehind(dir);

  return {
    branch,
    ...status,
    ...aheadBehind,
  };
}

/**
 * Format git status indicators
 *
 * @param info - Git info object
 * @returns Status string like "*+?" for dirty, staged, untracked
 */
export function formatGitIndicators(info: GitInfo): string {
  let indicators = '';
  if (info.isDirty) indicators += '*';
  if (info.hasStaged) indicators += '+';
  if (info.hasUntracked) indicators += '?';
  if (info.ahead > 0) indicators += `↑${info.ahead}`;
  if (info.behind > 0) indicators += `↓${info.behind}`;
  return indicators;
}
