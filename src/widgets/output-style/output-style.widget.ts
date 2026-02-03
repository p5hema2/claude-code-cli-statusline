/**
 * Output style widget
 *
 * Displays the current output style (e.g., "concise", "verbose", "explanatory").
 * Supports configurable colors per style.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getColor } from '../shared/index.js';

/** Output style widget schema - defines all GUI metadata */
export const OutputStyleSchema: WidgetSchema = {
  id: 'outputStyle',
  meta: {
    displayName: 'Output Style',
    description: 'Current output style (concise, verbose, etc.)',
    category: 'model',
  },
  options: {
    content: {
      color: 'cyan',
      stateColors: [
        { key: 'concise', label: 'Concise Style', default: 'cyan' },
        { key: 'verbose', label: 'Verbose Style', default: 'cyan' },
        { key: 'explanatory', label: 'Explanatory Style', default: 'cyan' },
      ],
    },
  },
  previewStates: [
    { id: 'concise', label: 'Concise', description: 'Concise output style' },
    { id: 'verbose', label: 'Verbose', description: 'Verbose output style' },
    { id: 'explanatory', label: 'Explanatory', description: 'Explanatory output style' },
  ],
};

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

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const outputStyle = ctx.status.output_style;
    if (!outputStyle?.name) return null;

    const styleName = outputStyle.name;
    const styleType = detectStyleType(styleName);

    // Determine color: use style-specific color, or simple color, or default cyan
    const color: ColorValue = styleType
      ? (getColor(config, styleType) ?? 'cyan')
      : (config?.color ?? 'cyan');

    return colorize(styleName, color);
  },
};
