/**
 * Weekly Sonnet usage widget
 *
 * Displays the 7-day usage specifically for Sonnet model from OAuth API.
 * This is separate from the all-models limit.
 */

import chalk from 'chalk';
import { createUsageBar, colorize } from '../utils/colors.js';
import { formatResetTime } from '../utils/cache.js';
import type { Widget, RenderContext } from './Widget.js';
import type { WeeklySonnetOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';

export const WeeklySonnetWidget: Widget = {
  name: 'weeklySonnet',
  label: '7d-S',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.weekly_sonnet) return null;

    const config = getWidgetConfig(ctx, 'weeklySonnet');
    const options = config?.options as WeeklySonnetOptions | undefined;

    const { percent_used, reset_time } = ctx.usage.weekly_sonnet;

    const label = formatLabel(config, '7d-S');
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
