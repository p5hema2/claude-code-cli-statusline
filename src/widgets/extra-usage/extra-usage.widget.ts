/**
 * Extra usage widget
 *
 * Displays overuse credits tracking for Max subscribers who exceed included limits.
 * This widget tracks paid overuse credits with a different structure than regular usage limits.
 */

import chalk from 'chalk';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, UsageBarColors } from '../../types/index.js';
import { createUsageBar, colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Extra usage widget schema - defines all GUI metadata */
export const ExtraUsageSchema: WidgetSchema = {
  id: 'extraUsage',
  meta: {
    displayName: 'Extra Usage',
    description: 'Overuse credits tracking',
    category: 'usage',
  },
  options: {
    content: { color: 'yellow' },
    bar: {
      enabled: true,
      colors: {
        low: 'green',
        medium: 'yellow',
        high: 'red',
      },
    },
    custom: [
      { key: 'showBar', type: 'checkbox', label: 'Show usage bar', default: true },
      { key: 'showCredits', type: 'checkbox', label: 'Show credit amounts', default: true },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Extra"' },
      { key: 'labelColor', type: 'color', label: 'Label Color', default: 'dim' },
      {
        key: 'naVisibility',
        type: 'select',
        label: 'Visibility when disabled',
        options: [
          { value: 'hide', label: 'Hide widget' },
          { value: 'na', label: 'Show "N/A"' },
          { value: 'dash', label: 'Show "-"' },
          { value: 'empty', label: 'Show empty' },
          { value: 'off', label: 'Show "Off"' },
        ],
        default: 'hide',
      },
    ],
  },
  previewStates: [
    {
      id: 'low',
      label: 'Low',
      description: 'Low extra usage',
      mockData: {
        usage: {
          extra_usage: {
            is_enabled: true,
            monthly_limit: 100.0,
            used_credits: 15.5,
            utilization: 15.5,
          },
        },
      },
    },
    {
      id: 'medium',
      label: 'Medium',
      description: 'Medium extra usage',
      mockData: {
        usage: {
          extra_usage: {
            is_enabled: true,
            monthly_limit: 100.0,
            used_credits: 55.75,
            utilization: 55.75,
          },
        },
      },
    },
    {
      id: 'high',
      label: 'High',
      description: 'High extra usage',
      mockData: {
        usage: {
          extra_usage: {
            is_enabled: true,
            monthly_limit: 100.0,
            used_credits: 92.3,
            utilization: 92.3,
          },
        },
      },
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Extra usage not enabled',
      mockData: {
        usage: {
          extra_usage: {
            is_enabled: false,
            monthly_limit: null,
            used_credits: null,
            utilization: null,
          },
        },
      },
    },
    {
      id: 'noOAuth',
      label: 'No OAuth',
      description: 'Not using OAuth authentication',
      mockData: { usage: null },
    },
  ],
};

export const ExtraUsageWidget: Widget = {
  name: 'extraUsage',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const extraUsage = ctx.usage?.extra_usage;

    // No usage data available
    if (!extraUsage) {
      return renderWidgetWithLabel(null, config, 'yellow');
    }

    // Extra usage is disabled
    if (!extraUsage.is_enabled) {
      return renderWidgetWithLabel(null, config, 'yellow');
    }

    // Extra usage is enabled but no data yet
    if (extraUsage.utilization === null || extraUsage.used_credits === null || extraUsage.monthly_limit === null) {
      return renderWidgetWithLabel(null, config, 'yellow');
    }

    // Get options from inline config
    const showBar = getOption<boolean>(config, 'showBar');
    const showCredits = getOption<boolean>(config, 'showCredits');
    const barColors = getOption<UsageBarColors>(config, 'barColors');

    const parts: string[] = [];

    // Show usage bar
    if (showBar !== false) {
      const bar = createUsageBar(extraUsage.utilization, {
        colors: barColors,
        showBar: true,
        showPercent: false,
      });
      parts.push(bar);
    }

    // Show credit amounts
    if (showCredits !== false) {
      const used = `$${extraUsage.used_credits.toFixed(2)}`;
      const limit = `$${extraUsage.monthly_limit.toFixed(2)}`;
      const credits = colorize(`${used} / ${limit}`, config?.color ?? 'yellow', chalk.yellow);
      parts.push(credits);
    }

    const content = parts.join(' ');
    return renderWidgetWithLabel(content, config, 'yellow');
  },
};
