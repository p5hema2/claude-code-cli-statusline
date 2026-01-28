/**
 * Output style widget
 *
 * Displays the current output style (e.g., "concise", "verbose", "explanatory").
 * Supports configurable colors per style.
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';
import type { OutputStyleOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';
import { colorize } from '../utils/colors.js';

/** Known output style types */
type OutputStyleType = 'concise' | 'verbose' | 'explanatory';

/**
 * Detect output style type
 */
function detectStyleType(name: string): OutputStyleType | undefined {
  const lowerName = name.toLowerCase();
  if (lowerName === 'concise') return 'concise';
  if (lowerName === 'verbose') return 'verbose';
  if (lowerName === 'explanatory') return 'explanatory';
  return undefined;
}

export const OutputStyleWidget: Widget = {
  name: 'outputStyle',
  label: 'Style',

  render(ctx: RenderContext): string | null {
    const outputStyle = ctx.status.output_style;
    if (!outputStyle?.name) return null;

    const config = getWidgetConfig(ctx, 'outputStyle');
    const options = config?.options as OutputStyleOptions | undefined;

    const styleName = outputStyle.name;
    const styleType = detectStyleType(styleName);
    const label = formatLabel(config, 'Style');

    // Determine color: use style-specific color from options, or contentColor, or default cyan
    let content: string;
    if (styleType && options?.colors?.[styleType]) {
      content = colorize(styleName, options.colors[styleType]);
    } else {
      content = colorize(styleName, config?.contentColor, chalk.cyan);
    }

    return label + content;
  },
};
