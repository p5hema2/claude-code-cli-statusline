/**
 * Weekly usage widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { WeeklyUsageWidget } from './weekly-usage.widget.js';

describe('WeeklyUsageWidget', () => {
  it('should have correct name', () => {
    expect(WeeklyUsageWidget.name).toBe('weeklyUsage');
  });

  it('should render weekly usage when OAuth data available', () => {
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
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyUsageWidget.render(ctx);
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

    const result = WeeklyUsageWidget.render(ctx);
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
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'weeklyUsage', options: { label: '7d' } };
    const result = WeeklyUsageWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('7d:');
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

    const config = { widget: 'weeklyUsage', options: { naVisibility: 'na' } };
    const result = WeeklyUsageWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
