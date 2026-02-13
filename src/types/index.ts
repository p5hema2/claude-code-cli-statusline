/**
 * Type exports
 */

export { StatusJSONSchema, type StatusJSON } from './status-json.schema.js';
export type {
  UsageLimit,
  UsageResponse,
  ExtraUsage,
  CachedUsageEntry,
  CachedExtraUsage,
  UsageCache,
} from './usage-data.interface.js';
export type {
  WidgetConfig,
  Settings,
} from './settings.interface.js';
export type {
  WidgetMetadata,
  WidgetPreviewState,
  WidgetCategory,
  TerminalTheme,
  PreviewRequest,
  PreviewResponse,
  APIResponse,
  WidgetsResponse,
} from './configure-api.interface.js';
export type { RenderContext, Widget } from './widget.interface.js';
export type {
  WidgetSchema,
  WidgetMockData,
  ConfigOption,
  TextConfigOption,
  SelectConfigOption,
  CheckboxConfigOption,
  ColorConfigOption,
} from './widget-schema.interface.js';
export type { AnsiColor, AnsiModifier, ColorValue } from './colors.type.js';
export { VALID_COLORS, isValidColor } from './colors.type.js';
export type {
  DirectoryOptions,
  GitBranchSymbols,
  GitBranchIndicatorColors,
  GitBranchIndicatorVisibility,
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
} from './widget-options.interface.js';
export type { GitInfo } from './git.interface.js';
