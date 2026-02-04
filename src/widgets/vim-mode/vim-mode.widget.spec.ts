/**
 * Vim mode widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../configure/preview/ansi-to-html.util.js';

import { VimModeWidget } from './vim-mode.widget.js';

describe('VimModeWidget', () => {
  it('should have correct name', () => {
    expect(VimModeWidget.name).toBe('vimMode');
  });

  it('should render normal mode as NOR', () => {
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

    // Validate content: normal mode displays as "[NOR]" with brackets
    const plain = stripAnsi(result!);
    expect(plain).toBe('[NOR]');
  });

  it('should render insert mode as INS', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: { mode: 'insert' },
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = VimModeWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toBe('[INS]');
  });

  it('should render visual mode as VIS', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: { mode: 'visual' },
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = VimModeWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toBe('[VIS]');
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
