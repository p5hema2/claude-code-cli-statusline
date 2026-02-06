import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TokensCachedWidget } from './tokens-cached.widget.js';

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

describe('TokensCachedWidget', () => {
  it('should have correct name', () => {
    expect(TokensCachedWidget.name).toBe('tokensCached');
  });

  it('should render formatted token count', () => {
    const ctx = makeCtx({ status: { token_metrics: { cached_tokens: 120000 } } });

    const result = TokensCachedWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('120.0k');
  });

  it('should render with label', () => {
    const ctx = makeCtx({ status: { token_metrics: { cached_tokens: 1500000 } } });

    const config = { widget: 'tokensCached', options: { label: 'Cached' } };
    const result = TokensCachedWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Cached: 1.5M');
  });

  it('should return null when no token metrics', () => {
    const ctx = makeCtx({ status: {} });

    const result = TokensCachedWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'tokensCached', options: { naVisibility: 'na' } };
    const result = TokensCachedWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
