/**
 * API Duration widget
 *
 * Displays total API response time for the session.
 * Shows formatted duration (e.g., "2.3s", "1m 23s").
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize, formatDuration } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const ApiDurationSchema: WidgetSchema = {
  id: 'apiDuration',
  meta: {
    displayName: 'API Duration',
    description: 'API response time',
    category: 'usage',
  },
  options: {
    content: { color: 'white' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: 'API', maxLength: 20 },
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
      id: 'fast',
      label: 'Fast',
      description: 'Fast API response',
      mockData: { status: { cost: { total_api_duration_ms: 800 } } },
    },
    {
      id: 'moderate',
      label: 'Moderate',
      description: 'Moderate API response time',
      mockData: { status: { cost: { total_api_duration_ms: 15000 } } },
    },
    {
      id: 'slow',
      label: 'Slow',
      description: 'Slow API response time',
      mockData: { status: { cost: { total_api_duration_ms: 150000 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Cost data not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'white';

export const ApiDurationWidget: Widget = {
  name: 'apiDuration',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const durationMs = ctx.status.cost?.total_api_duration_ms;
    if (durationMs === undefined || durationMs === null) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(formatDuration(durationMs), color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
