/**
 * Turn Count widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TurnCountWidget } from './turn-count.widget.js';

describe('TurnCountWidget', () => {
  it('should have correct name', () => {
    expect(TurnCountWidget.name).toBe('turnCount');
  });

  it('should return null when turn_count is undefined', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
        turn_count: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TurnCountWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render turn count', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
        turn_count: 5,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TurnCountWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('5');
  });

  it('should render zero turns', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
        turn_count: 0,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TurnCountWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('0');
  });

  it('should render large turn count', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
        turn_count: 142,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TurnCountWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('142');
  });

  it('should apply custom color', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
        turn_count: 25,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'turnCount', color: 'cyan' as const };
    const result = TurnCountWidget.render(ctx, config);
    expect(result).toBeTruthy();
  });
});
