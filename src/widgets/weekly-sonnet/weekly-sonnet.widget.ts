/**
 * Weekly Sonnet usage widget
 *
 * Displays the 7-day usage specifically for Sonnet model from OAuth API.
 * This is separate from the all-models limit.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize, formatResetTime } from '../../utils/index.js';
import { getOption } from '../shared/index.js';

/** Weekly Sonnet usage widget schema - defines all GUI metadata */
export const WeeklySonnetSchema: WidgetSchema = {
  id: 'weeklySonnet',
  meta: {
    displayName: 'Weekly Sonnet',
    description: 'Weekly Sonnet model usage limit',
    category: 'usage',
  },
  options: {
    bar: {
      enabled: true,
      colors: {
        low: 'green',
        medium: 'yellow',
        high: 'red',
      },
    },
    custom: [
      { key: 'showBar', type: 'checkbox', label: 'Show usage bar', default: true },
      { key: 'showPercent', type: 'checkbox', label: 'Show percentage', default: true },
      { key: 'showResetTime', type: 'checkbox', label: 'Show reset time', default: true },
    ],
  },
  previewStates: [
    { id: 'low', label: 'Low', description: 'Low Sonnet usage' },
    { id: 'medium', label: 'Medium', description: 'Medium Sonnet usage' },
    { id: 'high', label: 'High', description: 'High Sonnet usage' },
    { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
  ],
};

export const WeeklySonnetWidget: Widget = {
  name: 'weeklySonnet',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.weekly_sonnet) return null;

    const { percent_used, reset_time } = ctx.usage.weekly_sonnet;

    // Get options from inline config
    const barColors = getOption<UsageBarColors>(config, 'barColors');
    const showBar = getOption<boolean>(config, 'showBar');
    const showPercent = getOption<boolean>(config, 'showPercent');
    const showResetTime = getOption<boolean>(config, 'showResetTime') !== false;

    const bar = createUsageBar(percent_used, {
      colors: barColors,
      showBar,
      showPercent,
    });

    // Optionally add reset time
    let resetSuffix = '';
    if (showResetTime) {
      const resetStr = formatResetTime(reset_time);
      resetSuffix = colorize(` (${resetStr})`, config?.color, chalk.dim);
    }

    return bar + resetSuffix;
  },
};
