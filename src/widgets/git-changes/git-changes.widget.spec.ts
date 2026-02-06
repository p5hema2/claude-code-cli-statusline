import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { GitChangesWidget } from './git-changes.widget.js';

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

describe('GitChangesWidget', () => {
  it('should have correct name', () => {
    expect(GitChangesWidget.name).toBe('gitChanges');
  });

  it('should render diff statistics', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: true, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, diffStats: { insertions: 42, deletions: 10 },
      },
    });

    const result = GitChangesWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('+42,-10');
  });

  it('should render zero changes', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, diffStats: { insertions: 0, deletions: 0 },
      },
    });

    const result = GitChangesWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe('+0,-0');
  });

  it('should render with label', () => {
    const ctx = makeCtx({
      mockGitInfo: {
        branch: 'main', isDirty: true, hasStaged: false, hasUntracked: false,
        ahead: 0, behind: 0, diffStats: { insertions: 5, deletions: 3 },
      },
    });

    const config = { widget: 'gitChanges', options: { label: 'Diff' } };
    const result = GitChangesWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Diff:');
    expect(plain).toContain('+5,-3');
  });

  it('should return null when not a git repo and naVisibility=hide', () => {
    const ctx = makeCtx({ mockGitInfo: null });

    const result = GitChangesWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when not a git repo and naVisibility=na', () => {
    const ctx = makeCtx({ mockGitInfo: null });

    const config = { widget: 'gitChanges', options: { naVisibility: 'na' } };
    const result = GitChangesWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });

  it('should return null when no current_dir', () => {
    const ctx = makeCtx({ status: {} });

    const result = GitChangesWidget.render(ctx);
    expect(result).toBeNull();
  });
});
