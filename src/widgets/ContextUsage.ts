/**
 * Context usage widget
 *
 * Displays the remaining context window percentage as a usage bar.
 * Note: This shows REMAINING percentage, not used percentage.
 */

import { createUsageBar } from '../utils/colors.js';
import type { Widget, RenderContext } from './Widget.js';
import type { ContextUsageOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';

export const ContextUsageWidget: Widget = {
  name: 'contextUsage',
  label: 'Ctx',

  render(ctx: RenderContext): string | null {
    const contextWindow = ctx.status.context_window;
    if (!contextWindow?.remaining_percentage) return null;

    const config = getWidgetConfig(ctx, 'contextUsage');
    const options = config?.options as ContextUsageOptions | undefined;

    const remaining = contextWindow.remaining_percentage;
    // Convert remaining to used for consistent display
    const used = 100 - remaining;

    const label = formatLabel(config, 'Ctx');
    const bar = createUsageBar(used, options?.barColors);

    return label + bar;
  },
};
