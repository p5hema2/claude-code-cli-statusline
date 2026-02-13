/**
 * Weekly Opus widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { WeeklyOpusWidget } from './weekly-opus.widget.js';

describe('WeeklyOpusWidget', () => {
  it('should have correct name', () => {
    expect(WeeklyOpusWidget.name).toBe('weeklyOpus');
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

    const result = WeeklyOpusWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should return null when weekly_opus is null', () => {
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

    const result = WeeklyOpusWidget.render(ctx);
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
        weekly_cowork: null,
        weekly_opus: { reset_time: '2026-02-20T00:00:00Z', percent_used: 35 },
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyOpusWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('35');
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
        weekly_cowork: null,
        weekly_opus: { reset_time: '2026-02-20T00:00:00Z', percent_used: 65 },
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = WeeklyOpusWidget.render(ctx);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('65');
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
        weekly_cowork: null,
        weekly_opus: { reset_time: '2026-02-20T00:00:00Z', percent_used: 90 },
        extra_usage: { is_enabled: false, monthly_limit: null, used_credits: null, utilization: null },
      },
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'weeklyOpus', options: { showResetTime: false } };
    const result = WeeklyOpusWidget.render(ctx, config);
    expect(result).toBeTruthy();

    const plain = stripAnsi(result!);
    expect(plain).toContain('90');
    expect(plain).not.toMatch(/\([^)]+\)/);
  });
});
