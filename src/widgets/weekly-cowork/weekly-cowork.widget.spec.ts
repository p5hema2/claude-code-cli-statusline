/**
 * Weekly Cowork widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { WeeklyCoworkWidget } from './weekly-cowork.widget.js';

describe('WeeklyCoworkWidget', () => {
  it('should have correct name', () => {
    expect(WeeklyCoworkWidget.name).toBe('weeklyCowork');
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

    const result = WeeklyCoworkWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should return null when weekly_cowork is null', () => {
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
        weekly_oauth_apps: null,
        weekly_cowork: null,
        weekly_opus: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyCoworkWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render usage bar with percentage', () => {
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
        weekly_oauth_apps: null,
        weekly_cowork: { reset_time: '2026-02-20T00:00:00Z', percent_used: 15 },
        weekly_opus: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyCoworkWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('15');
  });

  it('should render with reset time by default', () => {
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
        weekly_oauth_apps: null,
        weekly_cowork: { reset_time: '2026-02-20T00:00:00Z', percent_used: 50 },
        weekly_opus: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyCoworkWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('50');
  });

  it('should hide reset time when showResetTime is false', () => {
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
        weekly_oauth_apps: null,
        weekly_cowork: { reset_time: '2026-02-20T00:00:00Z', percent_used: 80 },
        weekly_opus: null,
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'weeklyCowork', options: { showResetTime: false } };
    const result = WeeklyCoworkWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('80');
    expect(plain).not.toMatch(/\([^)]+\)/);
  });
});
