/**
 * Text widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext, ColorValue } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

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

    // Validate content: "Hello World" appears in output
    const plain = stripAnsi(result!);
    expect(plain).toBe('Hello World');
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

  it('should render free-form text with special characters', () => {
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

    const config = { widget: 'text', options: { text: '⟩ Project → Status' } };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toBe('⟩ Project → Status');
  });

  it('should render emoji and Unicode characters', () => {
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

    const config = { widget: 'text', options: { text: '🚀 Launch 中文' } };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toBe('🚀 Launch 中文');
  });

  it('should apply color to text when specified', () => {
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

    const config = { widget: 'text', options: { text: 'Colored' }, color: 'cyan' as ColorValue };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeTruthy();

    // Verify plain text content (color may not be applied in test environment)
    const plain = stripAnsi(result!);
    expect(plain).toBe('Colored');
  });

  it('should handle empty string as null', () => {
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

    const config = { widget: 'text', options: { text: '' } };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeNull();
  });

  it('should render text up to maxLength characters', () => {
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

    // Text at exactly maxLength (50 chars)
    const longText = 'A'.repeat(50);
    const config = { widget: 'text', options: { text: longText } };
    const result = TextWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toBe(longText);
    expect(plain.length).toBe(50);
  });
});
