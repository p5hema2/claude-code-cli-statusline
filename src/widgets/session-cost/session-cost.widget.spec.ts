import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { SessionCostWidget } from './session-cost.widget.js';

describe('SessionCostWidget', () => {
  it('should have correct name', () => {
    expect(SessionCostWidget.name).toBe('sessionCost');
  });

  it('should return null when cost is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = SessionCostWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render formatted cost', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_cost_usd: 0.45 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = SessionCostWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('$');
    expect(plain).toContain('0.45');
  });

  it('should render low cost', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_cost_usd: 0.02 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = SessionCostWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('$0.02');
  });

  it('should render high cost', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_cost_usd: 12.5 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = SessionCostWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('$12.50');
  });

  it('should handle zero cost', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_cost_usd: 0 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = SessionCostWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('$0.00');
  });
});
