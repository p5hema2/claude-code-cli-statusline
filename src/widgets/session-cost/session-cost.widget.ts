/**
 * Session Cost widget
 *
 * Displays total session cost in USD.
 * Shows formatted cost like "$0.45" or "$12.50".
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize, formatCost } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const SessionCostSchema: WidgetSchema = {
  id: 'sessionCost',
  meta: {
    displayName: 'Session Cost',
    description: 'Session cost in USD',
    category: 'usage',
  },
  options: {
    content: { color: 'green' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: 'Cost', maxLength: 20 },
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
      id: 'low',
      label: 'Low',
      description: 'Low session cost',
      mockData: { status: { cost: { total_cost_usd: 0.02 } } },
    },
    {
      id: 'medium',
      label: 'Medium',
      description: 'Medium session cost',
      mockData: { status: { cost: { total_cost_usd: 0.45 } } },
    },
    {
      id: 'high',
      label: 'High',
      description: 'High session cost',
      mockData: { status: { cost: { total_cost_usd: 12.5 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Cost data not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'green';

export const SessionCostWidget: Widget = {
  name: 'sessionCost',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const cost = ctx.status.cost?.total_cost_usd;
    if (cost === undefined || cost === null) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(formatCost(cost), color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
