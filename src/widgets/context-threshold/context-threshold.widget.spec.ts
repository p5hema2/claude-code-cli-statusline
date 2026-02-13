import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { ContextThresholdWidget } from './context-threshold.widget.js';

describe('ContextThresholdWidget', () => {
  it('should have correct name', () => {
    expect(ContextThresholdWidget.name).toBe('contextThreshold');
  });

  it('should return null when threshold not exceeded', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, exceeds_200k_tokens: false },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ContextThresholdWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should return null when exceeds_200k_tokens is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ContextThresholdWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render warning when threshold exceeded', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, exceeds_200k_tokens: true },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ContextThresholdWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('OVER 200K');
  });

  it('should use custom warning text', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, exceeds_200k_tokens: true },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'contextThreshold', options: { warningText: '⚠️ HIGH' } };
    const result = ContextThresholdWidget.render(ctx, config);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('⚠️ HIGH');
  });
});
