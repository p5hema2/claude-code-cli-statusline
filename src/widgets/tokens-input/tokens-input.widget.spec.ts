import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { TokensInputWidget } from './tokens-input.widget.js';

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

describe('TokensInputWidget', () => {
  it('should have correct name', () => {
    expect(TokensInputWidget.name).toBe('tokensInput');
  });

  it('should render formatted token count', () => {
    const ctx = makeCtx({ status: { token_metrics: { input_tokens: 15200 } } });

    const result = TokensInputWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('15.2k');
  });

  it('should render with default label', () => {
    const ctx = makeCtx({ status: { token_metrics: { input_tokens: 1500 } } });

    const config = { widget: 'tokensInput', options: { label: 'In' } };
    const result = TokensInputWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('In: 1.5k');
  });

  it('should return null when no token metrics', () => {
    const ctx = makeCtx({ status: {} });

    const result = TokensInputWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'tokensInput', options: { naVisibility: 'na' } };
    const result = TokensInputWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });

  // Transcript-hydrated scenarios
  it('should render transcript-hydrated large token count', () => {
    const ctx = makeCtx({ status: { token_metrics: { input_tokens: 2_350_000 } } });

    const result = TokensInputWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe('2.4M');
  });

  it('should render zero input tokens', () => {
    const ctx = makeCtx({ status: { token_metrics: { input_tokens: 0 } } });

    const result = TokensInputWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe('0');
  });
});
