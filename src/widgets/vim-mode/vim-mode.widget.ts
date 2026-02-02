/**
 * Vim mode widget
 *
 * Displays the current vim mode (normal, insert, visual, etc.)
 * with configurable mode-specific coloring.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getColor } from '../shared/index.js';

/** Vim mode widget schema - defines all GUI metadata */
export const VimModeSchema: WidgetSchema = {
  id: 'vimMode',
  meta: {
    displayName: 'Vim Mode',
    description: 'Current Vim editing mode',
    category: 'editor',
  },
  options: {
    content: {
      stateColors: [
        { key: 'normal', label: 'Normal Mode', default: 'green' },
        { key: 'insert', label: 'Insert Mode', default: 'yellow' },
        { key: 'visual', label: 'Visual Mode', default: 'magenta' },
        { key: 'replace', label: 'Replace Mode', default: 'red' },
        { key: 'command', label: 'Command Mode', default: 'blue' },
      ],
    },
  },
  previewStates: [
    { id: 'normal', label: 'Normal', description: 'Vim normal mode' },
    { id: 'insert', label: 'Insert', description: 'Vim insert mode' },
    { id: 'visual', label: 'Visual', description: 'Vim visual mode' },
    { id: 'disabled', label: 'Disabled', description: 'Vim mode not enabled' },
  ],
};

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

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const vimMode = ctx.status.vim_mode;
    if (!vimMode?.mode) return null;

    const mode = vimMode.mode;
    const shortened = shortenMode(mode);

    // Get mode-specific color
    const modeType = getModeType(mode);
    const defaultColor = modeType ? DEFAULT_MODE_COLORS[modeType] : 'white';
    const modeColor = modeType
      ? (getColor(config, modeType) ?? defaultColor)
      : defaultColor;

    return colorize(`[${shortened}]`, modeColor);
  },
};
