/**
 * Context usage widget
 *
 * Displays the context window usage as a percentage bar.
 * Shows USED percentage (100 - remaining) for intuitive display.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar } from '../../utils/index.js';
import { getOption } from '../shared/index.js';

/** Context usage widget schema - defines all GUI metadata */
export const ContextUsageSchema: WidgetSchema = {
  id: 'contextUsage',
  meta: {
    displayName: 'Context Usage',
    description: 'Context window usage percentage',
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
    ],
  },
  previewStates: [
    { id: 'low', label: 'Low (20%)', description: '20% context used' },
    { id: 'medium', label: 'Medium (50%)', description: '50% context used' },
    { id: 'high', label: 'High (80%)', description: '80% context used' },
    { id: 'unavailable', label: 'Unavailable', description: 'Context info not available' },
  ],
};

export const ContextUsageWidget: Widget = {
  name: 'contextUsage',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const contextWindow = ctx.status.context_window;
    if (!contextWindow?.remaining_percentage) return null;

    const remaining = contextWindow.remaining_percentage;
    // Convert remaining to used for consistent display
    const used = 100 - remaining;

    // Get options from inline config
    const barColors = getOption<UsageBarColors>(config, 'barColors');
    const showBar = getOption<boolean>(config, 'showBar');
    const showPercent = getOption<boolean>(config, 'showPercent');

    return createUsageBar(used, {
      colors: barColors,
      showBar,
      showPercent,
    });
  },
};
