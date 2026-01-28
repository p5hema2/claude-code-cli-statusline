/**
 * Weekly Sonnet usage widget
 *
 * Displays the 7-day usage specifically for Sonnet model from OAuth API.
 * This is separate from the all-models limit.
 */

import chalk from 'chalk';
import { createUsageBar } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';

export const WeeklySonnetWidget: Widget = {
  name: 'weeklySonnet',
  label: '7d-S',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.weekly_sonnet) return null;

    const { percent_used, reset_time } = ctx.usage.weekly_sonnet;
    const resetStr = formatResetTime(reset_time);

    return (
      chalk.dim('7d-S:') +
      createUsageBar(percent_used) +
      chalk.dim(` (${resetStr})`)
    );
  },
};
