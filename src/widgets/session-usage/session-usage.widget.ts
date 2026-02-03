/**
 * Session usage widget
 *
 * Displays the 5-hour rolling session usage from OAuth API.
 * This is the most immediately relevant limit for active users.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize, formatResetTime } from '../../utils/index.js';
import { getOption } from '../shared/index.js';

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
    ],
  },
  previewStates: [
    { id: 'low', label: 'Low', description: 'Low session usage' },
    { id: 'medium', label: 'Medium', description: 'Medium session usage' },
    { id: 'high', label: 'High', description: 'High session usage' },
    { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
  ],
};

export const SessionUsageWidget: Widget = {
  name: 'sessionUsage',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.current_session) return null;

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

    return bar + resetSuffix;
  },
};
