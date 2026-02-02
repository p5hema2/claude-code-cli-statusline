/**
 * Widget interface types
 *
 * Defines the contract that all statusline widgets must implement.
 */

import type { GitInfo } from './git.interface.js';
import type { Settings, WidgetConfig } from './settings.interface.js';
import type { StatusJSON } from './status-json.schema.js';
import type { UsageCache } from './usage-data.interface.js';

/** Context passed to widgets during rendering */
export interface RenderContext {
  /** Parsed status JSON from Claude Code */
  status: StatusJSON;
  /** Cached usage data (null if unavailable) */
  usage: UsageCache | null;
  /** Terminal width in columns */
  terminalWidth: number;
  /** User settings */
  settings: Settings;
  /** Mock git info for preview mode (bypasses real git commands) */
  mockGitInfo?: GitInfo | null;
}

/** Widget interface that all statusline widgets must implement */
export interface Widget {
  /** Unique identifier for the widget */
  name: string;
  /**
   * Render the widget content
   * @param ctx - Render context with status, usage, and settings
   * @param config - Optional inline widget configuration
   * @returns Rendered string with ANSI codes, or null if widget should be hidden
   */
  render(ctx: RenderContext, config?: WidgetConfig): string | null;
}
