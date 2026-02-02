/**
 * Widget registry and exports
 *
 * All available widgets and their schemas are registered here.
 * The unified registry provides both widget implementations and their
 * metadata schemas for the configuration GUI.
 */

export type { Widget, RenderContext } from '../types/index.js';
export type { WidgetSchema } from '../types/index.js';

// Widget exports
export { DirectoryWidget, DirectorySchema } from './directory/index.js';
export { GitBranchWidget, GitBranchSchema } from './git-branch/index.js';
export { ModelWidget, ModelSchema } from './model/index.js';
export { ContextUsageWidget, ContextUsageSchema } from './context-usage/index.js';
export { SessionUsageWidget, SessionUsageSchema } from './session-usage/index.js';
export { WeeklyUsageWidget, WeeklyUsageSchema } from './weekly-usage/index.js';
export { WeeklySonnetWidget, WeeklySonnetSchema } from './weekly-sonnet/index.js';
export { UsageAgeWidget, UsageAgeSchema } from './usage-age/index.js';
export { OutputStyleWidget, OutputStyleSchema } from './output-style/index.js';
export { VimModeWidget, VimModeSchema } from './vim-mode/index.js';
export { TextWidget, TextSchema } from './text/index.js';
export { SeparatorWidget, SeparatorSchema } from './separator/index.js';

import type { WidgetSchema , Widget } from '../types/index.js';

import { ContextUsageWidget, ContextUsageSchema } from './context-usage/index.js';
import { DirectoryWidget, DirectorySchema } from './directory/index.js';
import { GitBranchWidget, GitBranchSchema } from './git-branch/index.js';
import { ModelWidget, ModelSchema } from './model/index.js';
import { OutputStyleWidget, OutputStyleSchema } from './output-style/index.js';
import { SeparatorWidget, SeparatorSchema } from './separator/index.js';
import { SessionUsageWidget, SessionUsageSchema } from './session-usage/index.js';
import { TextWidget, TextSchema } from './text/index.js';
import { UsageAgeWidget, UsageAgeSchema } from './usage-age/index.js';
import { VimModeWidget, VimModeSchema } from './vim-mode/index.js';
import { WeeklySonnetWidget, WeeklySonnetSchema } from './weekly-sonnet/index.js';
import { WeeklyUsageWidget, WeeklyUsageSchema } from './weekly-usage/index.js';

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
