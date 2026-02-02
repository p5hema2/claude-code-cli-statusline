/**
 * Vim mode widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { VimModeWidget } from './vim-mode.widget.js';

describe('VimModeWidget', () => {
  it('should have correct name', () => {
    expect(VimModeWidget.name).toBe('vimMode');
  });

  it('should render vim mode', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: { mode: 'normal' },
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = VimModeWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions about mode display
  });

  it('should return null when no vim mode', () => {
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
    };

    const result = VimModeWidget.render(ctx);
    expect(result).toBeNull();
  });
});
