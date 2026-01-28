/**
 * Vim mode widget
 *
 * Displays the current vim mode (normal, insert, visual, etc.)
 * with configurable mode-specific coloring.
 */

import type { Widget, RenderContext } from './Widget.js';
import type { VimModeOptions, VimModeColors } from '../types/WidgetOptions.js';
import type { ColorValue } from '../types/Colors.js';
import { getWidgetConfig, formatLabel } from './helpers.js';
import { colorize } from '../utils/colors.js';

/** Vim mode types for color mapping */
type VimModeType = 'normal' | 'insert' | 'visual' | 'replace' | 'command';

/** Default colors for each vim mode */
const DEFAULT_MODE_COLORS: Record<VimModeType, ColorValue> = {
  normal: 'green',
  insert: 'yellow',
  visual: 'magenta',
  replace: 'red',
  command: 'blue',
};

/**
 * Get the mode type for color lookup
 */
function getModeType(mode: string): VimModeType | undefined {
  const lowerMode = mode.toLowerCase();
  switch (lowerMode) {
    case 'normal':
      return 'normal';
    case 'insert':
      return 'insert';
    case 'visual':
    case 'visual-line':
    case 'visual-block':
      return 'visual';
    case 'replace':
      return 'replace';
    case 'command':
      return 'command';
    default:
      return undefined;
  }
}

/**
 * Get color for vim mode with custom colors support
 */
function getModeColor(
  mode: string,
  customColors?: VimModeColors
): ColorValue {
  const modeType = getModeType(mode);
  if (!modeType) return 'white';

  // Use custom color if provided, otherwise use default
  return customColors?.[modeType] ?? DEFAULT_MODE_COLORS[modeType];
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

    const config = getWidgetConfig(ctx, 'vimMode');
    const options = config?.options as VimModeOptions | undefined;

    const mode = vimMode.mode;
    const shortened = shortenMode(mode);
    const label = formatLabel(config, '');

    // Get mode-specific color
    const modeColor = getModeColor(mode, options?.colors);
    const content = colorize(`[${shortened}]`, modeColor);

    return label + content;
  },
};
