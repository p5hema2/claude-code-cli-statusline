import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/widget.helper.js';

export const SessionIdSchema: WidgetSchema = {
  id: 'sessionId',
  meta: {
    displayName: 'Session ID',
    description: 'Current Claude Code session identifier',
    category: 'model',
  },
  options: {
    content: { color: 'cyan' },
    custom: [
      {
        key: 'maxLength',
        type: 'select',
        label: 'Max Length',
        options: [
          { value: '0', label: 'Full' },
          { value: '8', label: '8 chars' },
          { value: '12', label: '12 chars' },
          { value: '16', label: '16 chars' },
        ],
        default: '0',
      },
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
      id: 'standard',
      label: 'Standard',
      description: 'Typical session ID',
      mockData: { status: { session_id: 'abc123-def456-ghi789' } },
    },
    {
      id: 'short',
      label: 'Short',
      description: 'Short session ID',
      mockData: { status: { session_id: 'sess-42f8a' } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Session ID not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'cyan';

export const SessionIdWidget: Widget = {
  name: 'sessionId',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const sessionId = ctx.status.session_id;
    if (!sessionId) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const maxLengthStr = getOption<string>(config, 'maxLength') ?? '0';
    const maxLength = parseInt(maxLengthStr, 10);
    const display = maxLength > 0 && sessionId.length > maxLength
      ? sessionId.slice(0, maxLength) + '…'
      : sessionId;

    const color = config?.color ?? DEFAULT_COLOR;
    const content = colorize(display, color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
