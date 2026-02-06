import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/widget.helper.js';

export const VersionSchema: WidgetSchema = {
  id: 'version',
  meta: {
    displayName: 'Version',
    description: 'Claude Code CLI version number',
    category: 'model',
  },
  options: {
    content: { color: 'dim' },
    custom: [
      {
        key: 'showPrefix',
        type: 'checkbox',
        label: 'Show "v" prefix',
        default: true,
      },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "CLI"' },
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
      id: 'stable',
      label: 'Stable',
      description: 'Stable release version',
      mockData: { status: { version: '1.0.20' } },
    },
    {
      id: 'prerelease',
      label: 'Pre-release',
      description: 'Pre-release version',
      mockData: { status: { version: '2.0.0-beta.3' } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Version not available',
      mockData: { status: {} },
    },
  ],
};

const DEFAULT_COLOR: ColorValue = 'dim';

export const VersionWidget: Widget = {
  name: 'version',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const version = ctx.status.version;
    if (!version) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const showPrefix = getOption<boolean>(config, 'showPrefix') !== false;
    const color = config?.color ?? DEFAULT_COLOR;
    const display = showPrefix ? `v${version}` : version;
    const content = colorize(display, color);
    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
