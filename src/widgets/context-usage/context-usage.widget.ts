/**
 * Context usage widget
 *
 * Displays the context window usage as a percentage bar.
 * Shows USED percentage (100 - remaining) for intuitive display.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

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
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Ctx"' },
      { key: 'labelColor', type: 'color', label: 'Label Color', default: 'dim' },
      {
        key: 'naVisibility',
        type: 'select',
        label: 'Visibility on N/A',
        options: [
          { value: 'hide', label: 'Hide widget' },
          { value: 'na', label: 'Show "N/A"' },
          { value: 'dash', label: 'Show "-"' },
          { value: 'empty', label: 'Show empty' },
        ],
        default: 'hide',
      },
    ],
  },
  previewStates: [
    {
      id: 'low', label: 'Low (20%)', description: '20% context used',
      mockData: { status: { context_window: { remaining_percentage: 80 } } },
    },
    {
      id: 'medium', label: 'Medium (50%)', description: '50% context used',
      mockData: { status: { context_window: { remaining_percentage: 50 } } },
    },
    {
      id: 'high', label: 'High (80%)', description: '80% context used',
      mockData: { status: { context_window: { remaining_percentage: 20 } } },
    },
    {
      id: 'unavailable', label: 'Unavailable', description: 'Context info not available',
      mockData: { status: {} },
    },
  ],
};

export const ContextUsageWidget: Widget = {
  name: 'contextUsage',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const contextWindow = ctx.status.context_window;
    if (!contextWindow?.remaining_percentage) {
      return renderWidgetWithLabel(null, config, 'green');
    }

    const remaining = contextWindow.remaining_percentage;
    // Convert remaining to used for consistent display
    const used = 100 - remaining;

    // Get options from inline config
    const barColors = getOption<UsageBarColors>(config, 'barColors');
    const showBar = getOption<boolean>(config, 'showBar');
    const showPercent = getOption<boolean>(config, 'showPercent');

    const content = createUsageBar(used, {
      colors: barColors,
      showBar,
      showPercent,
    });

    return renderWidgetWithLabel(content, config, 'green');
  },
};
