import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { ApiDurationWidget } from './api-duration.widget.js';

describe('ApiDurationWidget', () => {
  it('should have correct name', () => {
    expect(ApiDurationWidget.name).toBe('apiDuration');
  });

  it('should return null when cost is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ApiDurationWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render formatted duration', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_api_duration_ms: 2300 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ApiDurationWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toMatch(/[0-9]/); // Should contain some number
  });

  it('should format long durations with minutes', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_api_duration_ms: 150000 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ApiDurationWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toMatch(/[12]/); // Should contain minute or second component
  });
});
