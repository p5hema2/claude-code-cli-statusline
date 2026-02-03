/**
 * Output style widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { OutputStyleWidget } from './output-style.widget.js';

describe('OutputStyleWidget', () => {
  it('should have correct name', () => {
    expect(OutputStyleWidget.name).toBe('outputStyle');
  });

  it('should render output style', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: { name: 'explanatory' },
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = OutputStyleWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions
  });

  it('should return null when no output style', () => {
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

    const result = OutputStyleWidget.render(ctx);
    expect(result).toBeNull();
  });
});
