/**
 * Weekly usage widget
 *
 * Displays the 7-day usage across all models from OAuth API.
 */

import chalk from 'chalk';
import { createUsageBar, colorize } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';
import type { WeeklyUsageOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';

export const WeeklyUsageWidget: Widget = {
  name: 'weeklyUsage',
  label: '7d',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.weekly_all) return null;

    const config = getWidgetConfig(ctx, 'weeklyUsage');
    const options = config?.options as WeeklyUsageOptions | undefined;

    const { percent_used, reset_time } = ctx.usage.weekly_all;

    const label = formatLabel(config, '7d');
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
