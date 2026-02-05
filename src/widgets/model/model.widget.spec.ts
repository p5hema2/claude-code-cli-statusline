/**
 * Model widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

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

  // Label functionality tests
  it('should render with label when label option provided', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: { id: 'claude-sonnet-4-20250514', display_name: 'Sonnet 4' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'model', options: { label: 'Model' } };
    const result = ModelWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Model:');
    expect(plain).toMatch(/Model: .+/);
  });

  it('should show N/A when model null and naVisibility=na', () => {
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

    const config = { widget: 'model', options: { naVisibility: 'na', label: 'Model' } };
    const result = ModelWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Model: N/A');
  });

  it('should show dash when model null and naVisibility=dash', () => {
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

    const config = { widget: 'model', options: { naVisibility: 'dash' } };
    const result = ModelWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('-');
  });
});
