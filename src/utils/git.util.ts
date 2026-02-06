/**
 * Git operations for statusline
 *
 * Provides git branch and status information for the current directory.
 */

import { execSync } from 'node:child_process';

import type { GitInfo } from '../types/index.js';

// Re-export GitInfo for backward compatibility
export type { GitInfo } from '../types/index.js';

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
 * Parse insertion count from git diff --shortstat output
 */
function parseInsertions(shortstat: string): number {
  const match = shortstat.match(/(\d+) insertion/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Parse deletion count from git diff --shortstat output
 */
function parseDeletions(shortstat: string): number {
  const match = shortstat.match(/(\d+) deletion/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get combined diff statistics (staged + unstaged)
 *
 * @param dir - Directory to check
 * @returns Object with insertion and deletion counts
 */
export function getDiffStats(dir: string): { insertions: number; deletions: number } {
  try {
    const unstaged = execSync('git diff --shortstat', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    }).trim();

    const staged = execSync('git diff --cached --shortstat', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    }).trim();

    return {
      insertions: parseInsertions(unstaged) + parseInsertions(staged),
      deletions: parseDeletions(unstaged) + parseDeletions(staged),
    };
  } catch {
    return { insertions: 0, deletions: 0 };
  }
}

/**
 * Get current git worktree name
 *
 * @param dir - Directory to check
 * @returns Worktree name, or null if in main working directory or not a repo
 */
export function getWorktreeName(dir: string): string | null {
  try {
    const gitDir = execSync('git rev-parse --git-dir', {
      cwd: dir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    }).trim();

    // Worktrees: gitDir = '/path/to/main/.git/worktrees/<worktree-name>'
    if (gitDir.includes('.git/worktrees/')) {
      const parts = gitDir.split('/');
      return parts[parts.length - 1];
    }

    return null;
  } catch {
    return null;
  }
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
