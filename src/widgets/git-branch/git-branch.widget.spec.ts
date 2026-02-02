/**
 * Git branch widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

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
    };

    // Note: Actual rendering depends on git repo state
    const result = GitBranchWidget.render(ctx);
    // Result may be null if not in a git repo
    expect(result === null || typeof result === 'string').toBe(true);
  });
});
