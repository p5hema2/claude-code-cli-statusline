/**
 * Git branch widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { GitBranchWidget } from './git-branch.widget.js';

describe('GitBranchWidget', () => {
  it('should have correct name', () => {
    expect(GitBranchWidget.name).toBe('gitBranch');
  });

  it('should render when git info is available', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects/app',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
      mockGitInfo: { branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false, ahead: 0, behind: 0 },
    };

    const result = GitBranchWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('main');
  });

  // Label functionality tests
  it('should render with label when label option provided', () => {
    const ctx: RenderContext = {
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
      mockGitInfo: { branch: 'feat/test', isDirty: false, hasStaged: false, hasUntracked: false, ahead: 0, behind: 0 },
    };

    const config = { widget: 'gitBranch', options: { label: 'Branch' } };
    const result = GitBranchWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Branch:');
    expect(plain).toContain('feat/test');
  });

  it('should show N/A when git info null and naVisibility=na', () => {
    const ctx: RenderContext = {
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
      mockGitInfo: null,
    };

    const config = { widget: 'gitBranch', options: { naVisibility: 'na', label: 'Branch' } };
    const result = GitBranchWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Branch: N/A');
  });
});
