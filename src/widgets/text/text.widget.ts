/**
 * Text widget
 *
 * Displays configurable static text with optional color.
 * Useful for adding custom labels, prefixes, or decorations to the statusline.
 *
 * @example
 * { widget: 'text', options: { text: 'Hello' }, color: 'cyan' }
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { colorize } from '../../utils/index.js';

/** Text widget schema - defines all GUI metadata */
export const TextSchema: WidgetSchema = {
  id: 'text',
  meta: {
    displayName: 'Text',
    description: 'Static text with optional color',
    category: 'layout',
  },
  options: {
    content: { color: 'white' },
    custom: [
      {
        key: 'text',
        type: 'text',
        label: 'Text Content',
        default: '',
        maxLength: 100,
        placeholder: 'Enter custom text, emoji, or Unicode...',
      },
    ],
  },
};

/** Text options type */
interface TextOptions {
  text?: string;
}

export const TextWidget: Widget = {
  name: 'text',

  render(_ctx: RenderContext, config?: WidgetConfig): string | null {
    const options = config?.options as TextOptions | undefined;
    const text = options?.text;

    // Return null if no text configured
    if (!text) return null;

    // Apply color
    return colorize(text, config?.color);
  },
};
