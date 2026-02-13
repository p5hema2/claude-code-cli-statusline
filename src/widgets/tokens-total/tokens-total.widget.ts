import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize, formatTokens } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const TokensTotalSchema: WidgetSchema = {
  id: 'tokensTotal',
  meta: {
    displayName: 'Tokens (Total)',
    description: 'Total token count',
    category: 'tokens',
  },
  options: {
    content: { color: 'yellow' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: 'Total', maxLength: 20, placeholder: 'e.g., "Total"' },
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
      description: 'Low total tokens',
      mockData: { status: { token_metrics: { total_tokens: 2000 } } },
    },
    {
      id: 'high',
      label: 'High',
      description: 'High total tokens',
      mockData: { status: { token_metrics: { total_tokens: 186000 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Token metrics not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'yellow';

export const TokensTotalWidget: Widget = {
  name: 'tokensTotal',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const tokens = ctx.status.token_metrics?.total_tokens;
    if (tokens === undefined || tokens === null) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(formatTokens(tokens), color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
