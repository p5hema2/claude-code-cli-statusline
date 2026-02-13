import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize, formatTokens } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const TokensCachedSchema: WidgetSchema = {
  id: 'tokensCached',
  meta: {
    displayName: 'Tokens (Cached)',
    description: 'Cached tokens from prompt caching',
    category: 'usage',
  },
  options: {
    content: { color: 'cyan' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: 'Cached', maxLength: 20, placeholder: 'e.g., "Cached"' },
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
      description: 'Low cached tokens',
      mockData: { status: { token_metrics: { input_tokens: 1500, output_tokens: 500, cached_tokens: 1000 } } },
    },
    {
      id: 'high',
      label: 'High',
      description: 'High cached tokens',
      mockData: { status: { token_metrics: { input_tokens: 152000, output_tokens: 34000, cached_tokens: 120000 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Token metrics not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'cyan';

export const TokensCachedWidget: Widget = {
  name: 'tokensCached',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const tokens = ctx.status.token_metrics?.cached_tokens;
    if (tokens === undefined || tokens === null) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(formatTokens(tokens), color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
