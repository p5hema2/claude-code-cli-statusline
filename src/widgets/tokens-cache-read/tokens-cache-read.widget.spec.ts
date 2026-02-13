import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TokensCacheReadWidget } from './tokens-cache-read.widget.js';

describe('TokensCacheReadWidget', () => {
  it('should have correct name', () => {
    expect(TokensCacheReadWidget.name).toBe('tokensCacheRead');
  });

  it('should return null when token_metrics is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensCacheReadWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render formatted cache read tokens', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, token_metrics: { cache_read_tokens: 8000 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensCacheReadWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('8');
  });

  it('should format large numbers', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, token_metrics: { cache_read_tokens: 120000 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensCacheReadWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toMatch(/120/);
  });
});
