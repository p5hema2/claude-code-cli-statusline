/**
 * Text widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { TextWidget } from './text.widget.js';

describe('TextWidget', () => {
  it('should have correct name', () => {
    expect(TextWidget.name).toBe('text');
  });

  it('should render configured text', () => {
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

    const config = { widget: 'text', options: { text: 'Hello World' } };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeTruthy();
    // TODO: Add assertion checking if "Hello World" is in result
  });

  it('should return null when no text configured', () => {
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

    const result = TextWidget.render(ctx);
    expect(result).toBeNull();
  });
});
