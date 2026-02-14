/**
 * Weekly Opus usage widget
 *
 * Displays the 7-day usage specifically for Opus model from OAuth API.
 * Returns null when no Opus usage exists.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize, formatResetTime } from '../../utils/index.js';
import { mockCachedEntry } from '../mock/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Weekly Opus usage widget schema - defines all GUI metadata */
export const WeeklyOpusSchema: WidgetSchema = {
  id: 'weeklyOpus',
  meta: {
    displayName: 'Weekly Opus (EXPERIMENTAL)',
    description: '7-day Opus model usage limit (untested - no account access)',
    category: 'limits',
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
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Opus"' },
      { key: 'labelColor', type: 'color', label: 'Label Color', default: 'dim' },
      {
        key: 'naVisibility',
        type: 'select',
        label: 'Visibility on N/A',
        options: [
          { value: 'hide', label: 'Hide widget' },
          { value: 'na', label: 'Show "N/A"' },
          { value: 'dash', label: 'Show "-"' },
          { value: 'empty', label: 'Show empty' },
        ],
        default: 'hide',
      },
    ],
  },
  previewStates: [
    {
      id: 'low', label: 'Low', description: 'Low Opus usage',
      mockData: { usage: { weekly_opus: mockCachedEntry(20) } },
    },
    {
      id: 'medium', label: 'Medium', description: 'Medium Opus usage',
      mockData: { usage: { weekly_opus: mockCachedEntry(50) } },
    },
    {
      id: 'high', label: 'High', description: 'High Opus usage',
      mockData: { usage: { weekly_opus: mockCachedEntry(80) } },
    },
    {
      id: 'noData', label: 'No Data', description: 'No Opus usage',
      mockData: { usage: { weekly_opus: null } },
    },
  ],
};

export const WeeklyOpusWidget: Widget = {
  name: 'weeklyOpus',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.weekly_opus) {
      return renderWidgetWithLabel(null, config, 'green');
    }

    const { percent_used, reset_time } = ctx.usage.weekly_opus;

    const barColors = getOption<UsageBarColors>(config, 'barColors');
    const showBar = getOption<boolean>(config, 'showBar');
    const showPercent = getOption<boolean>(config, 'showPercent');
    const showResetTime = getOption<boolean>(config, 'showResetTime') !== false;

    const bar = createUsageBar(percent_used, {
      colors: barColors,
      showBar,
      showPercent,
    });

    let resetSuffix = '';
    if (showResetTime) {
      const resetStr = formatResetTime(reset_time);
      resetSuffix = colorize(` (${resetStr})`, config?.color, chalk.dim);
    }

    const content = bar + resetSuffix;
    return renderWidgetWithLabel(content, config, 'green');
  },
};
