import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const SessionClockSchema: WidgetSchema = {
  id: 'sessionClock',
  meta: {
    displayName: 'Session Clock',
    description: 'Elapsed time since session started',
    category: 'usage',
  },
  options: {
    content: { color: 'yellow' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Session"' },
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
      id: 'short',
      label: 'Short',
      description: 'Short session (under an hour)',
      mockData: { status: { session_duration: '15m' } },
    },
    {
      id: 'medium',
      label: 'Medium',
      description: 'Medium session (1-2 hours)',
      mockData: { status: { session_duration: '1hr 30m' } },
    },
    {
      id: 'long',
      label: 'Long',
      description: 'Long session (4+ hours)',
      mockData: { status: { session_duration: '4hr 15m' } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Session duration not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'yellow';

export const SessionClockWidget: Widget = {
  name: 'sessionClock',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const duration = ctx.status.session_duration;
    if (!duration) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(duration, color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
