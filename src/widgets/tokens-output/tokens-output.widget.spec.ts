import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TokensOutputWidget } from './tokens-output.widget.js';

function makeCtx(overrides?: Partial<RenderContext>): RenderContext {
  return {
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
    ...overrides,
  };
}

describe('TokensOutputWidget', () => {
  it('should have correct name', () => {
    expect(TokensOutputWidget.name).toBe('tokensOutput');
  });

  it('should render formatted token count', () => {
    const ctx = makeCtx({ status: { token_metrics: { output_tokens: 3400 } } });

    const result = TokensOutputWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('3.4k');
  });

  it('should render with label', () => {
    const ctx = makeCtx({ status: { token_metrics: { output_tokens: 500 } } });

    const config = { widget: 'tokensOutput', options: { label: 'Out' } };
    const result = TokensOutputWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Out: 500');
  });

  it('should return null when no token metrics', () => {
    const ctx = makeCtx({ status: {} });

    const result = TokensOutputWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'tokensOutput', options: { naVisibility: 'na' } };
    const result = TokensOutputWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
