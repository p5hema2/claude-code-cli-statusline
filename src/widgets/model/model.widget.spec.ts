/**
 * Model widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { ModelWidget } from './model.widget.js';

describe('ModelWidget', () => {
  it('should have correct name', () => {
    expect(ModelWidget.name).toBe('model');
  });

  it('should render model name', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: { id: 'claude-sonnet-4-20250514', display_name: 'Claude 4 Sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ModelWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions about model name formatting
  });

  it('should return null when no model', () => {
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

    const result = ModelWidget.render(ctx);
    expect(result).toBeNull();
  });
});
