/**
 * Directory widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { DirectoryWidget } from './directory.widget.js';

describe('DirectoryWidget', () => {
  it('should have correct name', () => {
    expect(DirectoryWidget.name).toBe('directory');
  });

  it('should render shortened path', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects/app/src',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = DirectoryWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions
  });

  it('should return null when no directory', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = DirectoryWidget.render(ctx);
    expect(result).toBeNull();
  });
});
