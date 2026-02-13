/**
 * Code Changes widget
 *
 * Displays total lines added/removed in the session.
 * Shows git-style diff stats: +156 -23
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { colorize } from '../../utils/index.js';
import { renderWidgetWithLabel } from '../shared/index.js';

export const CodeChangesSchema: WidgetSchema = {
  id: 'codeChanges',
  meta: {
    displayName: 'Code Changes',
    description: 'Lines added/removed',
    category: 'usage',
  },
  options: {
    content: { color: 'white' },
    custom: [
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Lines"' },
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
      id: 'small',
      label: 'Small',
      description: 'Small changes',
      mockData: { status: { cost: { total_lines_added: 23, total_lines_removed: 5 } } },
    },
    {
      id: 'large',
      label: 'Large',
      description: 'Large changes',
      mockData: { status: { cost: { total_lines_added: 345, total_lines_removed: 127 } } },
    },
    {
      id: 'additionsOnly',
      label: 'Additions',
      description: 'Only additions',
      mockData: { status: { cost: { total_lines_added: 89, total_lines_removed: 0 } } },
    },
    {
      id: 'deletionsOnly',
      label: 'Deletions',
      description: 'Only deletions',
      mockData: { status: { cost: { total_lines_added: 0, total_lines_removed: 42 } } },
    },
    {
      id: 'noData',
      label: 'No Data',
      description: 'Cost data not available',
      mockData: { status: {} },
    },
  ],
};

export const CodeChangesWidget: Widget = {
  name: 'codeChanges',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const added = ctx.status.cost?.total_lines_added;
    const removed = ctx.status.cost?.total_lines_removed;

    if (added === undefined || removed === undefined) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    const parts: string[] = [];
    if (added > 0) {
      parts.push(colorize(`+${added}`, 'green', chalk.green));
    }
    if (removed > 0) {
      parts.push(colorize(`-${removed}`, 'red', chalk.red));
    }

    if (parts.length === 0) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    const content = parts.join(' ');
    return renderWidgetWithLabel(content, config, 'white');
  },
};
