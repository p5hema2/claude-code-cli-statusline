/**
 * Type exports
 */

export { StatusJSONSchema, type StatusJSON } from './StatusJSON.js';
export type {
  UsageLimit,
  UsageResponse,
  CachedUsageEntry,
  UsageCache,
} from './UsageData.js';
export type {
  WidgetConfig,
  ColorScheme,
  RowAlign,
  RowConfig,
  Settings,
} from './Settings.js';
export { DEFAULT_SETTINGS } from './Settings.js';
export type {
  WidgetMetadata,
  WidgetPreviewState,
  WidgetCategory,
  TerminalTheme,
  PreviewRequest,
  PreviewResponse,
  APIResponse,
  WidgetsResponse,
} from './ConfigureAPI.js';
export type { RenderContext, Widget } from './Widget.js';
export type { AnsiColor, AnsiModifier, ColorValue } from './Colors.js';
export { VALID_COLORS, isValidColor } from './Colors.js';
export type {
  DirectoryOptions,
  GitBranchColors,
  GitBranchSymbols,
  GitBranchOptions,
  VimModeColors,
  VimModeOptions,
  UsageBarColors,
  UsageWidgetOptions,
  ModelColors,
  ModelOptions,
  OutputStyleColors,
  OutputStyleOptions,
  UsageAgeOptions,
  ContextUsageOptions,
  SessionUsageOptions,
  WeeklyUsageOptions,
  WeeklySonnetOptions,
  WidgetOptionsType,
} from './WidgetOptions.js';
