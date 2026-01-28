/**
 * Context usage widget
 *
 * Displays the remaining context window percentage as a usage bar.
 * Note: This shows REMAINING percentage, not used percentage.
 */

import chalk from 'chalk';
import { createUsageBar } from '../utils/colors.js';
import type { Widget, RenderContext } from './Widget.js';

export const ContextUsageWidget: Widget = {
  name: 'contextUsage',
  label: 'Ctx',

  render(ctx: RenderContext): string | null {
    const contextWindow = ctx.status.context_window;
    if (!contextWindow?.remaining_percentage) return null;

    const remaining = contextWindow.remaining_percentage;
    // Convert remaining to used for consistent display
    const used = 100 - remaining;

    return chalk.dim('Ctx:') + createUsageBar(used);
  },
};
