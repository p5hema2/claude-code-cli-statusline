/**
 * Usage age widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';

import { UsageAgeWidget } from './usage-age.widget.js';

describe('UsageAgeWidget', () => {
  it('should have correct name', () => {
    expect(UsageAgeWidget.name).toBe('usageAge');
  });

  it('should render query time when usage data available', () => {
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
      },
      terminalWidth: 80,
      settings: {},
    };

    const result = UsageAgeWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions about time formatting
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

    const result = UsageAgeWidget.render(ctx);
    expect(result).toBeNull();
  });
});
