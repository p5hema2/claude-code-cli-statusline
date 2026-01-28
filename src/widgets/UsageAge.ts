/**
 * Usage age widget
 *
 * Displays when the usage data was last queried from the OAuth API.
 * Uses absolute time (e.g., "@ 14:32") instead of relative time ("5m ago")
 * because the statusline isn't re-rendered continuously - relative time
 * would become stale and misleading.
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';
import type { UsageAgeOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';
import { colorize } from '../utils/colors.js';

/**
 * Format timestamp as absolute time (HH:MM)
 *
 * @param timestampMs - Unix timestamp in milliseconds
 * @returns Formatted time like "@ 14:32"
 */
function formatQueryTime(timestampMs: number): string {
  const date = new Date(timestampMs);
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `@ ${hours}:${mins}`;
}

export const UsageAgeWidget: Widget = {
  name: 'usageAge',
  label: 'Queried',

  render(ctx: RenderContext): string | null {
    if (!ctx.usage?.timestamp) return null;

    const config = getWidgetConfig(ctx, 'usageAge');
    const options = config?.options as UsageAgeOptions | undefined;

    const timeStr = formatQueryTime(ctx.usage.timestamp);
    const label = formatLabel(config, '');

    // Colorize icon and time separately
    const icon = colorize('⟳ ', options?.iconColor, chalk.dim);
    const time = colorize(timeStr, options?.timeColor ?? config?.contentColor, chalk.gray);

    return label + icon + time;
  },
};
