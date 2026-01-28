/**
 * Widget registry and exports
 *
 * All available widgets are registered here in display order.
 */

export type { Widget, RenderContext } from './Widget.js';

export { DirectoryWidget } from './Directory.js';
export { GitBranchWidget } from './GitBranch.js';
export { ModelWidget } from './Model.js';
export { ContextUsageWidget } from './ContextUsage.js';
export { SessionUsageWidget } from './SessionUsage.js';
export { WeeklyUsageWidget } from './WeeklyUsage.js';
export { WeeklySonnetWidget } from './WeeklySonnet.js';
export { UsageAgeWidget } from './UsageAge.js';
export { OutputStyleWidget } from './OutputStyle.js';
export { VimModeWidget } from './VimMode.js';

import type { Widget } from './Widget.js';
import { DirectoryWidget } from './Directory.js';
import { GitBranchWidget } from './GitBranch.js';
import { ModelWidget } from './Model.js';
import { ContextUsageWidget } from './ContextUsage.js';
import { SessionUsageWidget } from './SessionUsage.js';
import { WeeklyUsageWidget } from './WeeklyUsage.js';
import { WeeklySonnetWidget } from './WeeklySonnet.js';
import { UsageAgeWidget } from './UsageAge.js';
import { OutputStyleWidget } from './OutputStyle.js';
import { VimModeWidget } from './VimMode.js';

/**
 * Default widget order for the statusline
 *
 * Widgets are rendered left-to-right in this order.
 * Users can customize which widgets are enabled via settings.
 */
export const DEFAULT_WIDGETS: Widget[] = [
  DirectoryWidget,
  GitBranchWidget,
  ModelWidget,
  ContextUsageWidget,
  SessionUsageWidget,
  WeeklyUsageWidget,
  WeeklySonnetWidget,
  UsageAgeWidget,
  OutputStyleWidget,
  VimModeWidget,
];

/**
 * Widget registry keyed by name
 */
export const WIDGET_REGISTRY: Record<string, Widget> = {
  directory: DirectoryWidget,
  gitBranch: GitBranchWidget,
  model: ModelWidget,
  contextUsage: ContextUsageWidget,
  sessionUsage: SessionUsageWidget,
  weeklyUsage: WeeklyUsageWidget,
  weeklySonnet: WeeklySonnetWidget,
  usageAge: UsageAgeWidget,
  outputStyle: OutputStyleWidget,
  vimMode: VimModeWidget,
};
