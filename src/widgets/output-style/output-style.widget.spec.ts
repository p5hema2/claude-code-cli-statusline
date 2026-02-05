/**
 * Output style widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

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

  // Label functionality tests
  it('should render with label when provided', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: { name: 'concise' },
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'outputStyle', options: { label: 'Style' } };
    const result = OutputStyleWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Style:');
  });

  it('should show N/A when output style null and naVisibility=na', () => {
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

    const config = { widget: 'outputStyle', options: { naVisibility: 'na' } };
    const result = OutputStyleWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
