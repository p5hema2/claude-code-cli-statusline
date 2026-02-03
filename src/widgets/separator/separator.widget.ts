/**
 * Separator widget
 *
 * Displays a separator character between widgets.
 * Smart separator logic in the renderer handles skipping separators
 * when adjacent widgets return empty content.
 *
 * @example
 * { widget: 'separator' }  // Default: dim '|'
 * { widget: 'separator', options: { text: '•' }, color: 'dim' }
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { colorize } from '../../utils/index.js';

/** Separator widget schema - defines all GUI metadata */
export const SeparatorSchema: WidgetSchema = {
  id: 'separator',
  meta: {
    displayName: 'Separator',
    description: 'Visual separator between widgets',
    category: 'location',
  },
  options: {
    content: { color: 'dim' },
    custom: [
      {
        key: 'text',
        type: 'select',
        label: 'Separator Character',
        options: [
          { value: '|', label: '| (pipe)' },
          { value: '•', label: '• (bullet)' },
          { value: '·', label: '· (middle dot)' },
          { value: '/', label: '/ (slash)' },
          { value: '⟩', label: '⟩ (chevron)' },
          { value: '│', label: '│ (box vertical)' },
        ],
        default: '|',
      },
    ],
  },
};

/** Separator options type */
interface SeparatorOptions {
  text?: string;
}

export const SeparatorWidget: Widget = {
  name: 'separator',

  render(_ctx: RenderContext, config?: WidgetConfig): string | null {
    const options = config?.options as SeparatorOptions | undefined;
    const text = options?.text ?? '|';

    // Apply color (default to dim if not specified)
    const color = config?.color ?? 'dim';
    return colorize(text, color);
  },
};
