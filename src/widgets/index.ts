/**
 * Widget registry and exports
 *
 * All available widgets and their schemas are registered here.
 * The unified registry provides both widget implementations and their
 * metadata schemas for the configuration GUI.
 */

export type { Widget, RenderContext } from '../types/index.js';
export type { WidgetSchema } from '../types/index.js';

// Mock helpers (re-exported for external consumers like configure/preview)
export { mockCachedEntry, mockTimestampAt } from './mock/mock.helper.js';

// Widget exports
export { DirectoryWidget, DirectorySchema } from './directory/directory.widget.js';
export { GitBranchWidget, GitBranchSchema } from './git-branch/git-branch.widget.js';
export { ModelWidget, ModelSchema } from './model/model.widget.js';
export { ContextUsageWidget, ContextUsageSchema } from './context-usage/context-usage.widget.js';
export { SessionUsageWidget, SessionUsageSchema } from './session-usage/session-usage.widget.js';
export { WeeklyUsageWidget, WeeklyUsageSchema } from './weekly-usage/weekly-usage.widget.js';
export { WeeklySonnetWidget, WeeklySonnetSchema } from './weekly-sonnet/weekly-sonnet.widget.js';
export { UsageAgeWidget, UsageAgeSchema } from './usage-age/usage-age.widget.js';
export { OutputStyleWidget, OutputStyleSchema } from './output-style/output-style.widget.js';
export { VimModeWidget, VimModeSchema } from './vim-mode/vim-mode.widget.js';
export { TextWidget, TextSchema } from './text/text.widget.js';
export { SeparatorWidget, SeparatorSchema } from './separator/separator.widget.js';

import type { WidgetSchema, Widget } from '../types/index.js';

import { ContextUsageWidget, ContextUsageSchema } from './context-usage/context-usage.widget.js';
import { DirectoryWidget, DirectorySchema } from './directory/directory.widget.js';
import { GitBranchWidget, GitBranchSchema } from './git-branch/git-branch.widget.js';
import { ModelWidget, ModelSchema } from './model/model.widget.js';
import { OutputStyleWidget, OutputStyleSchema } from './output-style/output-style.widget.js';
import { SeparatorWidget, SeparatorSchema } from './separator/separator.widget.js';
import { SessionUsageWidget, SessionUsageSchema } from './session-usage/session-usage.widget.js';
import { TextWidget, TextSchema } from './text/text.widget.js';
import { UsageAgeWidget, UsageAgeSchema } from './usage-age/usage-age.widget.js';
import { VimModeWidget, VimModeSchema } from './vim-mode/vim-mode.widget.js';
import { WeeklySonnetWidget, WeeklySonnetSchema } from './weekly-sonnet/weekly-sonnet.widget.js';
import { WeeklyUsageWidget, WeeklyUsageSchema } from './weekly-usage/weekly-usage.widget.js';

/** Widget entry with both implementation and schema */
export interface WidgetEntry {
  /** Widget implementation */
  widget: Widget;
  /** Widget schema (metadata for GUI) */
  schema: WidgetSchema;
}

/**
 * Unified widget registry - single source of truth for widgets and schemas
 *
 * This registry stores both the widget implementation and its schema together,
 * ensuring consistency between runtime behavior and configuration GUI.
 */
export const WIDGET_REGISTRY: Record<string, WidgetEntry> = {
  directory: { widget: DirectoryWidget, schema: DirectorySchema },
  gitBranch: { widget: GitBranchWidget, schema: GitBranchSchema },
  model: { widget: ModelWidget, schema: ModelSchema },
  contextUsage: { widget: ContextUsageWidget, schema: ContextUsageSchema },
  sessionUsage: { widget: SessionUsageWidget, schema: SessionUsageSchema },
  weeklyUsage: { widget: WeeklyUsageWidget, schema: WeeklyUsageSchema },
  weeklySonnet: { widget: WeeklySonnetWidget, schema: WeeklySonnetSchema },
  usageAge: { widget: UsageAgeWidget, schema: UsageAgeSchema },
  outputStyle: { widget: OutputStyleWidget, schema: OutputStyleSchema },
  vimMode: { widget: VimModeWidget, schema: VimModeSchema },
  text: { widget: TextWidget, schema: TextSchema },
  separator: { widget: SeparatorWidget, schema: SeparatorSchema },
};

/**
 * Get a widget by ID
 */
export function getWidget(id: string): Widget | undefined {
  return WIDGET_REGISTRY[id]?.widget;
}

/**
 * Get a widget's schema by ID
 */
export function getWidgetSchema(id: string): WidgetSchema | undefined {
  return WIDGET_REGISTRY[id]?.schema;
}

/**
 * Get all widget schemas
 */
export function getAllSchemas(): WidgetSchema[] {
  return Object.values(WIDGET_REGISTRY).map((entry) => entry.schema);
}
