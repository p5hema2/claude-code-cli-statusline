/**
 * Context Threshold widget
 *
 * Warning widget that appears only when context exceeds 200K tokens.
 * Returns null when under threshold - this is intentional warning-only behavior.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getOption } from '../shared/index.js';

export const ContextThresholdSchema: WidgetSchema = {
  id: 'contextThreshold',
  meta: {
    displayName: 'Context Threshold',
    description: 'Warning when exceeding 200K tokens',
    category: 'usage',
  },
  options: {
    content: { color: 'red' },
    custom: [
      { key: 'warningText', type: 'text', label: 'Warning Text', default: 'OVER 200K', maxLength: 30 },
    ],
  },
  previewStates: [
    {
      id: 'exceeded',
      label: 'Exceeded',
      description: 'Context exceeds 200K tokens',
      mockData: { status: { exceeds_200k_tokens: true } },
    },
    {
      id: 'normal',
      label: 'Normal',
      description: 'Context under threshold',
      mockData: { status: { exceeds_200k_tokens: false } },
    },
  ],
};

export const ContextThresholdWidget: Widget = {
  name: 'contextThreshold',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    // Only show warning when threshold is exceeded
    if (!ctx.status.exceeds_200k_tokens) {
      return null;
    }

    const warningText = getOption<string>(config, 'warningText') ?? 'OVER 200K';
    const color = config?.color ?? 'red';
    return colorize(warningText, color);
  },
};
