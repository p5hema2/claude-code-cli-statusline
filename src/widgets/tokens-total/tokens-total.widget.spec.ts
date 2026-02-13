import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TokensTotalWidget } from './tokens-total.widget.js';

describe('TokensTotalWidget', () => {
  it('should have correct name', () => {
    expect(TokensTotalWidget.name).toBe('tokensTotal');
  });

  it('should return null when token_metrics is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensTotalWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render formatted total tokens', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, token_metrics: { total_tokens: 5000 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensTotalWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('5');
  });

  it('should format large numbers with k suffix', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, token_metrics: { total_tokens: 152000 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = TokensTotalWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toMatch(/152/);
  });
});
