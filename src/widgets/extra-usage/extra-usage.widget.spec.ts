/**
 * Extra usage widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { ExtraUsageWidget } from './extra-usage.widget.js';

describe('ExtraUsageWidget', () => {
  it('should have correct name', () => {
    expect(ExtraUsageWidget.name).toBe('extraUsage');
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

    const result = ExtraUsageWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should return null when extra usage is disabled', () => {
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
        current_session: { reset_time: '2026-02-13T10:00:00Z', percent_used: 20 },
        weekly_all: { reset_time: '2026-02-20T00:00:00Z', percent_used: 30 },
        weekly_sonnet: { reset_time: '2026-02-20T00:00:00Z', percent_used: 25 },
        extra_usage: {
          is_enabled: false,
          monthly_limit: null,
          used_credits: null,
          utilization: null,
        },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = ExtraUsageWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render with bar and credits when enabled', () => {
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
        current_session: { reset_time: '2026-02-13T10:00:00Z', percent_used: 20 },
        weekly_all: { reset_time: '2026-02-20T00:00:00Z', percent_used: 30 },
        weekly_sonnet: { reset_time: '2026-02-20T00:00:00Z', percent_used: 25 },
        extra_usage: {
          is_enabled: true,
          monthly_limit: 100.0,
          used_credits: 23.45,
          utilization: 23.45,
        },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = ExtraUsageWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('$23.45');
    expect(plain).toContain('$100.00');
  });

  it('should render only bar when showCredits is false', () => {
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
        current_session: { reset_time: '2026-02-13T10:00:00Z', percent_used: 20 },
        weekly_all: { reset_time: '2026-02-20T00:00:00Z', percent_used: 30 },
        weekly_sonnet: { reset_time: '2026-02-20T00:00:00Z', percent_used: 25 },
        extra_usage: {
          is_enabled: true,
          monthly_limit: 100.0,
          used_credits: 23.45,
          utilization: 23.45,
        },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'extraUsage', options: { showCredits: false } };
    const result = ExtraUsageWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).not.toContain('$23.45');
  });

  it('should render only credits when showBar is false', () => {
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
        current_session: { reset_time: '2026-02-13T10:00:00Z', percent_used: 20 },
        weekly_all: { reset_time: '2026-02-20T00:00:00Z', percent_used: 30 },
        weekly_sonnet: { reset_time: '2026-02-20T00:00:00Z', percent_used: 25 },
        extra_usage: {
          is_enabled: true,
          monthly_limit: 100.0,
          used_credits: 55.75,
          utilization: 55.75,
        },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'extraUsage', options: { showBar: false } };
    const result = ExtraUsageWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('$55.75');
    expect(plain).toContain('$100.00');
  });

  it('should handle high utilization', () => {
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
        current_session: { reset_time: '2026-02-13T10:00:00Z', percent_used: 20 },
        weekly_all: { reset_time: '2026-02-20T00:00:00Z', percent_used: 30 },
        weekly_sonnet: { reset_time: '2026-02-20T00:00:00Z', percent_used: 25 },
        extra_usage: {
          is_enabled: true,
          monthly_limit: 100.0,
          used_credits: 92.5,
          utilization: 92.5,
        },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = ExtraUsageWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('$92.50');
  });
});
