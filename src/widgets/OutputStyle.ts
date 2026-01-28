/**
 * Output style widget
 *
 * Displays the current output style (e.g., "concise", "verbose").
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';

export const OutputStyleWidget: Widget = {
  name: 'outputStyle',
  label: 'Style',

  render(ctx: RenderContext): string | null {
    const outputStyle = ctx.status.output_style;
    if (!outputStyle?.name) return null;

    return chalk.cyan(outputStyle.name);
  },
};
