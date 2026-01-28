/**
 * Widget interface types
 *
 * Defines the contract that all statusline widgets must implement.
 */

import type { StatusJSON } from './StatusJSON.js';
import type { UsageCache } from './UsageData.js';
import type { Settings } from './Settings.js';

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
}

/** Widget interface that all statusline widgets must implement */
export interface Widget {
  /** Unique identifier for the widget */
  name: string;
  /** Human-readable label for the widget */
  label?: string;
  /**
   * Render the widget content
   * @param ctx - Render context with status, usage, and settings
   * @returns Rendered string with ANSI codes, or null if widget should be hidden
   */
  render(ctx: RenderContext): string | null;
}
