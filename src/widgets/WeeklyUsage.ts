/**
 * Weekly usage widget
 *
 * Displays the 7-day usage across all models from OAuth API.
 */

import chalk from 'chalk';
import { createUsageBar } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';

export const WeeklyUsageWidget: Widget = {
  name: 'weeklyUsage',
  label: '7d',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.weekly_all) return null;

    const { percent_used, reset_time } = ctx.usage.weekly_all;
    const resetStr = formatResetTime(reset_time);

    return (
      chalk.dim('7d:') +
      createUsageBar(percent_used) +
      chalk.dim(` (${resetStr})`)
    );
  },
};
