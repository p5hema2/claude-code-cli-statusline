/**
 * Weekly OAuth Apps usage widget
 *
 * Displays the 7-day usage from OAuth-based applications.
 * Returns null when no OAuth app usage exists.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize, formatResetTime } from '../../utils/index.js';
import { mockCachedEntry } from '../mock/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Weekly OAuth Apps usage widget schema - defines all GUI metadata */
export const WeeklyOAuthAppsSchema: WidgetSchema = {
  id: 'weeklyOAuthApps',
  meta: {
    displayName: 'Weekly OAuth Apps',
    description: '7-day OAuth apps usage limit',
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
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "OAuth"' },
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
      id: 'low', label: 'Low', description: 'Low OAuth apps usage',
      mockData: { usage: { weekly_oauth_apps: mockCachedEntry(20) } },
    },
    {
      id: 'medium', label: 'Medium', description: 'Medium OAuth apps usage',
      mockData: { usage: { weekly_oauth_apps: mockCachedEntry(50) } },
    },
    {
      id: 'high', label: 'High', description: 'High OAuth apps usage',
      mockData: { usage: { weekly_oauth_apps: mockCachedEntry(80) } },
    },
    {
      id: 'noData', label: 'No Data', description: 'No OAuth app usage',
      mockData: { usage: { weekly_oauth_apps: null } },
    },
  ],
};

export const WeeklyOAuthAppsWidget: Widget = {
  name: 'weeklyOAuthApps',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.weekly_oauth_apps) {
      return renderWidgetWithLabel(null, config, 'green');
    }

    const { percent_used, reset_time } = ctx.usage.weekly_oauth_apps;

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

    const content = bar + resetSuffix;
    return renderWidgetWithLabel(content, config, 'green');
  },
};
