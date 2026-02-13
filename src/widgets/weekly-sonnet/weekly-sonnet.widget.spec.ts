/**
 * Weekly Sonnet usage widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { WeeklySonnetWidget} from './weekly-sonnet.widget.js';

describe('WeeklySonnetWidget', () => {
  it('should have correct name', () => {
    expect(WeeklySonnetWidget.name).toBe('weeklySonnet');
  });

  it('should render weekly Sonnet usage when OAuth data available', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: {
        timestamp: Date.now(),
        current_session: { percent_used: 25, reset_time: '2024-01-01T12:00:00Z' },
        weekly_all: { percent_used: 10, reset_time: '2024-01-07T00:00:00Z' },
        weekly_sonnet: { percent_used: 16, reset_time: '2024-01-07T00:00:00Z' },
      weekly_oauth_apps: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklySonnetWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions
  });

  it('should return null when no usage data', () => {
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

    const result = WeeklySonnetWidget.render(ctx);
    expect(result).toBeNull();
  });

  // Label tests
  it('should render with label', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: {
        timestamp: Date.now(),
        current_session: { percent_used: 25, reset_time: '2024-01-01T12:00:00Z' },
        weekly_all: { percent_used: 10, reset_time: '2024-01-07T00:00:00Z' },
        weekly_sonnet: { percent_used: 16, reset_time: '2024-01-07T00:00:00Z' },
      weekly_oauth_apps: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'weeklySonnet', options: { label: 'Sonnet' } };
    const result = WeeklySonnetWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Sonnet:');
  });

  it('should show N/A when usage null and naVisibility=na', () => {
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

    const config = { widget: 'weeklySonnet', options: { naVisibility: 'na' } };
    const result = WeeklySonnetWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
