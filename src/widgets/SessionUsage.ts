/**
 * Session usage widget
 *
 * Displays the 5-hour rolling session usage from OAuth API.
 * This is the most immediately relevant limit for active users.
 */

import chalk from 'chalk';
import { createUsageBar } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';

export const SessionUsageWidget: Widget = {
  name: 'sessionUsage',
  label: '5h',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.current_session) return null;

    const { percent_used, reset_time } = ctx.usage.current_session;
    const resetStr = formatResetTime(reset_time);

    return (
      chalk.dim('5h:') +
      createUsageBar(percent_used) +
      chalk.dim(` (${resetStr})`)
    );
  },
};
