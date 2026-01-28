/**
 * User settings types
 *
 * Configuration options for customizing the statusline appearance and behavior.
 */

/** Widget configuration */
export interface WidgetConfig {
  /** Whether the widget is enabled */
  enabled: boolean;
  /** Widget-specific options */
  options?: Record<string, unknown>;
}

/** Color scheme configuration */
export interface ColorScheme {
  /** Background color for the statusline */
  background?: string;
  /** Foreground (text) color */
  foreground?: string;
  /** Separator color */
  separator?: string;
}

/** User settings for the statusline */
export interface Settings {
  /** Widget configurations keyed by widget name */
  widgets?: Record<string, WidgetConfig>;
  /** Color scheme */
  colors?: ColorScheme;
  /** Separator character (default: standard) */
  separator?: string;
  /** Cache TTL in milliseconds (default: 300000 = 5 minutes) */
  cacheTtl?: number;
}

/** Default settings */
export const DEFAULT_SETTINGS: Settings = {
  widgets: {
    directory: { enabled: true },
    gitBranch: { enabled: true },
    model: { enabled: true },
    contextUsage: { enabled: true },
    sessionUsage: { enabled: true },
    weeklyUsage: { enabled: true },
    weeklySonnet: { enabled: true },
    outputStyle: { enabled: true },
    vimMode: { enabled: true },
  },
  separator: '|',
  cacheTtl: 300000, // 5 minutes
};
