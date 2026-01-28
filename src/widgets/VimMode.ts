/**
 * Vim mode widget
 *
 * Displays the current vim mode (normal, insert, visual, etc.)
 * with mode-specific coloring.
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';

/**
 * Get color for vim mode
 */
function getModeColor(
  mode: string
): (text: string) => string {
  const lowerMode = mode.toLowerCase();
  switch (lowerMode) {
    case 'normal':
      return chalk.green;
    case 'insert':
      return chalk.yellow;
    case 'visual':
    case 'visual-line':
    case 'visual-block':
      return chalk.magenta;
    case 'replace':
      return chalk.red;
    case 'command':
      return chalk.blue;
    default:
      return chalk.white;
  }
}

/**
 * Shorten vim mode name
 */
function shortenMode(mode: string): string {
  const lowerMode = mode.toLowerCase();
  switch (lowerMode) {
    case 'normal':
      return 'NOR';
    case 'insert':
      return 'INS';
    case 'visual':
      return 'VIS';
    case 'visual-line':
      return 'V-L';
    case 'visual-block':
      return 'V-B';
    case 'replace':
      return 'REP';
    case 'command':
      return 'CMD';
    default:
      return mode.slice(0, 3).toUpperCase();
  }
}

export const VimModeWidget: Widget = {
  name: 'vimMode',
  label: 'Vim',

  render(ctx: RenderContext): string | null {
    const vimMode = ctx.status.vim_mode;
    if (!vimMode?.mode) return null;

    const mode = vimMode.mode;
    const shortened = shortenMode(mode);
    const colorFn = getModeColor(mode);

    return colorFn(`[${shortened}]`);
  },
};
