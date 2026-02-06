import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { GitWorktreeWidget } from './git-worktree.widget.js';

function makeCtx(overrides?: Partial<RenderContext>): RenderContext {
  return {
    status: {
      current_dir: '/test',
      model: undefined,
      vim_mode: undefined,
      context_window: undefined,
      output_style: undefined,
    },
    usage: null,
    terminalWidth: 80,
    settings: {},
    ...overrides,
  };
}

describe('GitWorktreeWidget', () => {
  it('should have correct name', () => {
    expect(GitWorktreeWidget.name).toBe('gitWorktree');
  });

  it('should render worktree name with icon', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'feat/experiment', isDirty: false, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, worktreeName: 'feature-experiment',
      },
    });

    const result = GitWorktreeWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('𖠰');
    expect(plain).toContain('feature-experiment');
  });

  it('should render without icon when icon is empty', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, worktreeName: 'my-tree',
      },
    });

    const config = { widget: 'gitWorktree', options: { icon: '' } };
    const result = GitWorktreeWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('my-tree');
  });

  it('should return null when in main working directory', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, worktreeName: null,
      },
    });

    const result = GitWorktreeWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should return null when not a git repo', () => {
    const ctx = makeCtx({ mockGitInfo: null });

    const result = GitWorktreeWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when not a repo and naVisibility=na', () => {
    const ctx = makeCtx({ mockGitInfo: null });

    const config = { widget: 'gitWorktree', options: { naVisibility: 'na', label: 'Tree' } };
    const result = GitWorktreeWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Tree: N/A');
  });

  it('should render with label', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, worktreeName: 'hotfix',
      },
    });

    const config = { widget: 'gitWorktree', options: { label: 'Tree' } };
    const result = GitWorktreeWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Tree:');
    expect(plain).toContain('hotfix');
  });
});
