/**
 * Separator widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { SeparatorWidget } from './separator.widget.js';

describe('SeparatorWidget', () => {
  it('should have correct name', () => {
    expect(SeparatorWidget.name).toBe('separator');
  });

  it('should render default separator', () => {
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

    const result = SeparatorWidget.render(ctx);
    expect(result).toBeTruthy();

    // Validate content: default separator is ' | ' (with spacing)
    const plain = stripAnsi(result!);
    expect(plain).toBe(' | ');
  });

  it('should render custom separator text', () => {
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

    const config = { widget: 'separator', options: { text: '•' } };
    const result = SeparatorWidget.render(ctx, config);
    expect(result).toBeTruthy();

    // Validate content: custom separator '•' (with default spacing)
    const plain = stripAnsi(result!);
    expect(plain).toBe(' • ');
  });

  it('should render with space before only', () => {
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

    const config = {
      widget: 'separator',
      options: { spaceBefore: true, spaceAfter: false },
    };
    const result = SeparatorWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe(' |');
  });

  it('should render with space after only', () => {
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

    const config = {
      widget: 'separator',
      options: { spaceBefore: false, spaceAfter: true },
    };
    const result = SeparatorWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('| ');
  });

  it('should render with no spacing', () => {
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

    const config = {
      widget: 'separator',
      options: { spaceBefore: false, spaceAfter: false },
    };
    const result = SeparatorWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('|');
  });

  it('should render with default spacing when options omitted', () => {
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

    const result = SeparatorWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe(' | '); // backward compatibility
  });
});
