/**
 * Usage age widget
 *
 * Displays when the usage data was last queried from the OAuth API.
 * Uses absolute time (e.g., "@ 14:32") instead of relative time ("5m ago")
 * because the statusline isn't re-rendered continuously - relative time
 * would become stale and misleading.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Usage age widget schema - defines all GUI metadata */
export const UsageAgeSchema: WidgetSchema = {
  id: 'usageAge',
  meta: {
    displayName: 'Query Time',
    description: 'When usage data was last queried (absolute time)',
    category: 'usage',
  },
  options: {
    custom: [
      { key: 'iconColor', type: 'color', label: 'Icon Color', default: 'dim' },
      { key: 'timeColor', type: 'color', label: 'Time Color', default: 'gray' },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Queried"' },
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
    { id: 'morning', label: 'Morning', description: 'Shows @ 09:30' },
    { id: 'afternoon', label: 'Afternoon', description: 'Shows @ 14:15' },
    { id: 'evening', label: 'Evening', description: 'Shows @ 19:45' },
    { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
  ],
};

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

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (!ctx.usage?.timestamp) {
      return renderWidgetWithLabel(null, config, 'gray');
    }

    const timeStr = formatQueryTime(ctx.usage.timestamp);

    // Get colors from inline config options
    const iconColor = getOption<ColorValue>(config, 'iconColor') ?? 'dim';
    const timeColor = getOption<ColorValue>(config, 'timeColor') ?? config?.color ?? 'gray';

    // Colorize icon and time separately
    const icon = colorize('⟳ ', iconColor);
    const time = colorize(timeStr, timeColor);

    const content = icon + time;
    return renderWidgetWithLabel(content, config, 'gray');
  },
};
