/**
 * Widget-specific option types
 *
 * Each widget can have unique configuration options beyond the common
 * label and color settings. These types define the schema for each widget's
 * options property.
 */

import type { ColorValue } from './colors.type.js';

/**
 * Directory widget options
 */
export interface DirectoryOptions {
  /** Path display format */
  format?: 'full' | 'shortened' | 'project-only';
  /** Maximum length before truncation (only for 'full' format) */
  maxLength?: number;
}

/**
 * Git branch widget symbols
 */
export interface GitBranchSymbols {
  /** Symbol for uncommitted changes (default: *) */
  dirty?: string;
  /** Symbol for staged changes (default: +) */
  staged?: string;
  /** Symbol for untracked files (default: ?) */
  untracked?: string;
  /** Symbol for ahead of remote (default: ↑) */
  ahead?: string;
  /** Symbol for behind remote (default: ↓) */
  behind?: string;
}

/**
 * Colors for each git status indicator symbol
 *
 * Allows customizing the color of each indicator independently for
 * better visual distinction between different git states.
 */
export interface GitBranchIndicatorColors {
  /** Color for dirty indicator (default: red) */
  dirty?: ColorValue;
  /** Color for staged indicator (default: green) */
  staged?: ColorValue;
  /** Color for untracked indicator (default: yellow) */
  untracked?: ColorValue;
  /** Color for ahead indicator (default: cyan) */
  ahead?: ColorValue;
  /** Color for behind indicator (default: red) */
  behind?: ColorValue;
}

/**
 * Visibility settings for each git status indicator
 *
 * Allows showing/hiding individual indicators based on user preference.
 */
export interface GitBranchIndicatorVisibility {
  /** Show dirty indicator (default: true) */
  dirty?: boolean;
  /** Show staged indicator (default: true) */
  staged?: boolean;
  /** Show untracked indicator (default: true) */
  untracked?: boolean;
  /** Show ahead indicator (default: true) */
  ahead?: boolean;
  /** Show behind indicator (default: true) */
  behind?: boolean;
}

/**
 * Git branch widget options
 */
export interface GitBranchOptions {
  /** Color for the branch name (default: green) */
  branchColor?: ColorValue;
  /** Custom symbols for status indicators */
  symbols?: GitBranchSymbols;
  /** Colors for each indicator symbol */
  indicatorColors?: GitBranchIndicatorColors;
  /** Visibility for each indicator */
  indicatorVisibility?: GitBranchIndicatorVisibility;
}

/**
 * Vim mode widget colors for each mode
 */
export interface VimModeColors {
  /** Color for normal mode (default: green) */
  normal?: ColorValue;
  /** Color for insert mode (default: yellow) */
  insert?: ColorValue;
  /** Color for visual mode (default: magenta) */
  visual?: ColorValue;
  /** Color for replace mode (default: red) */
  replace?: ColorValue;
  /** Color for command mode (default: blue) */
  command?: ColorValue;
}

/**
 * Vim mode widget options
 */
export interface VimModeOptions {
  /** Colors for each vim mode */
  colors?: VimModeColors;
}

/**
 * Usage bar colors based on percentage thresholds
 */
export interface UsageBarColors {
  /** Color for low usage (0-49%, default: green) */
  low?: ColorValue;
  /** Color for medium usage (50-79%, default: yellow) */
  medium?: ColorValue;
  /** Color for high usage (80-100%, default: red) */
  high?: ColorValue;
}

/**
 * Common options for usage widgets (Session, Weekly, WeeklySonnet)
 */
export interface UsageWidgetOptions {
  /** Colors for the usage bar */
  barColors?: UsageBarColors;
  /** Whether to show the usage bar (default: true) */
  showBar?: boolean;
  /** Whether to show the percentage (default: true) */
  showPercent?: boolean;
  /** Whether to show reset time (default: true) */
  showResetTime?: boolean;
}

/**
 * Model widget colors for each model family
 */
export interface ModelColors {
  /** Color for Opus models */
  opus?: ColorValue;
  /** Color for Sonnet models */
  sonnet?: ColorValue;
  /** Color for Haiku models */
  haiku?: ColorValue;
}

/**
 * Model widget options
 */
export interface ModelOptions {
  /** Colors for each model family */
  colors?: ModelColors;
}

/**
 * Output style widget colors
 */
export interface OutputStyleColors {
  /** Color for concise style */
  concise?: ColorValue;
  /** Color for verbose style */
  verbose?: ColorValue;
  /** Color for explanatory style */
  explanatory?: ColorValue;
}

/**
 * Output style widget options
 */
export interface OutputStyleOptions {
  /** Colors for each output style */
  colors?: OutputStyleColors;
}

/**
 * Usage age widget options
 */
export interface UsageAgeOptions {
  /** Color for the refresh icon */
  iconColor?: ColorValue;
  /** Color for the time text */
  timeColor?: ColorValue;
}

/**
 * Context usage widget options (extends usage bar options)
 */
export type ContextUsageOptions = UsageWidgetOptions;

/**
 * Session usage widget options (extends usage bar options)
 */
export type SessionUsageOptions = UsageWidgetOptions;

/**
 * Weekly usage widget options (extends usage bar options)
 */
export type WeeklyUsageOptions = UsageWidgetOptions;

/**
 * Weekly Sonnet usage widget options (extends usage bar options)
 */
export type WeeklySonnetOptions = UsageWidgetOptions;

/**
 * Union type of all widget options for type narrowing
 */
export type WidgetOptionsType =
  | DirectoryOptions
  | GitBranchOptions
  | VimModeOptions
  | UsageWidgetOptions
  | ModelOptions
  | OutputStyleOptions
  | UsageAgeOptions;
