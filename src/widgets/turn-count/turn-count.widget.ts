/**
 * Turn Count widget
 *
 * Displays the number of conversation turns (assistant responses) in the session.
 * Data is hydrated from transcript parsing.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

/** Turn Count widget schema - defines all GUI metadata */
export const TurnCountSchema: WidgetSchema = {
  id: 'turnCount',
  meta: {
    displayName: 'Turn Count',
    description: 'Number of conversation turns',
    category: 'usage',
  },
  options: {
    content: { color: 'white' },
    custom: [
      { key: 'label', type: 'text', label: 'Label', default: 'Turns', maxLength: 20 },
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
      id: 'few',
      label: 'Few',
      description: 'Few conversation turns',
      mockData: { status: { turn_count: 3 } },
    },
    {
      id: 'many',
      label: 'Many',
      description: 'Many conversation turns',
      mockData: { status: { turn_count: 47 } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Turn count not available',
      mockData: { status: { turn_count: undefined } },
    },
  ],
};

export const TurnCountWidget: Widget = {
  name: 'turnCount',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    if (ctx.status.turn_count === undefined) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    const content = colorize(String(ctx.status.turn_count), config?.color ?? 'white');
    return renderWidgetWithLabel(content, config, 'white');
  },
};
