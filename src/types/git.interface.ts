/**
 * Git information types
 *
 * Type definitions for git repository state.
 */

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
  /** Diff statistics (insertions/deletions) for git-changes widget */
  diffStats?: { insertions: number; deletions: number };
  /** Worktree name for git-worktree widget (null = main working directory) */
  worktreeName?: string | null;
}
