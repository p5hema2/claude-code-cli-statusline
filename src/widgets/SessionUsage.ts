/**
 * Session usage widget
 *
 * Displays the 5-hour rolling session usage from OAuth API.
 * This is the most immediately relevant limit for active users.
 */

import chalk from 'chalk';
import { createUsageBar, colorize } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';
import type { SessionUsageOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';

export const SessionUsageWidget: Widget = {
  name: 'sessionUsage',
  label: '5h',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.current_session) return null;

    const config = getWidgetConfig(ctx, 'sessionUsage');
    const options = config?.options as SessionUsageOptions | undefined;

    const { percent_used, reset_time } = ctx.usage.current_session;

    const label = formatLabel(config, '5h');
    const bar = createUsageBar(percent_used, options?.barColors);

    // Optionally hide reset time
    const showResetTime = options?.showResetTime !== false;
    let resetSuffix = '';
    if (showResetTime) {
      const resetStr = formatResetTime(reset_time);
      resetSuffix = colorize(` (${resetStr})`, config?.contentColor, chalk.dim);
    }

    return label + bar + resetSuffix;
  },
};
