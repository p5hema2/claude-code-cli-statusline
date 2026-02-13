/**
 * Session usage widget
 *
 * Displays the 5-hour rolling session usage from OAuth API.
 * This is the most immediately relevant limit for active users.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize, formatResetTime } from '../../utils/index.js';
import { mockCachedEntry } from '../mock/mock.helper.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Session usage widget schema - defines all GUI metadata */
export const SessionUsageSchema: WidgetSchema = {
  id: 'sessionUsage',
  meta: {
    displayName: 'Session Usage',
    description: 'Current session usage for OAuth users',
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
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "5h"' },
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
      id: 'low', label: 'Low', description: 'Low session usage',
      mockData: { usage: { current_session: mockCachedEntry(20) } },
    },
    {
      id: 'medium', label: 'Medium', description: 'Medium session usage',
      mockData: { usage: { current_session: mockCachedEntry(50) } },
    },
    {
      id: 'high', label: 'High', description: 'High session usage',
      mockData: { usage: { current_session: mockCachedEntry(80) } },
    },
    {
      id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication',
      mockData: { usage: null },
    },
  ],
};

export const SessionUsageWidget: Widget = {
  name: 'sessionUsage',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.current_session) {
      return renderWidgetWithLabel(null, config, 'green');
    }

    const { percent_used, reset_time } = ctx.usage.current_session;

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
