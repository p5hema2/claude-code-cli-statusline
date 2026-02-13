import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize, formatTokens } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const TokensCacheReadSchema: WidgetSchema = {
  id: 'tokensCacheRead',
  meta: {
    displayName: 'Tokens (Cache Read)',
    description: 'Cache read tokens',
    category: 'tokens',
  },
  options: {
    content: { color: 'magenta' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: 'Read', maxLength: 20, placeholder: 'e.g., "Read"' },
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
      description: 'Low cache read tokens',
      mockData: { status: { token_metrics: { cache_read_tokens: 5000 } } },
    },
    {
      id: 'high',
      label: 'High',
      description: 'High cache read tokens',
      mockData: { status: { token_metrics: { cache_read_tokens: 120000 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Token metrics not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'magenta';

export const TokensCacheReadWidget: Widget = {
  name: 'tokensCacheRead',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const tokens = ctx.status.token_metrics?.cache_read_tokens;
    if (tokens === undefined || tokens === null) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(formatTokens(tokens), color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
