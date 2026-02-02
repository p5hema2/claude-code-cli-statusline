/**
 * Types for the configuration GUI API
 *
 * Defines request/response shapes for the REST API that powers
 * the browser-based configuration interface.
 */

import type { Settings } from './settings.interface.js';
import type { WidgetSchema } from './widget-schema.interface.js';

/** Widget metadata for the GUI */
export interface WidgetMetadata {
  /** Unique widget identifier */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Brief description of what the widget shows */
  description: string;
  /** Category for grouping in the palette */
  category: string;
  /** Available states for preview (N/A toggles) */
  previewStates?: WidgetPreviewState[];
}

/** Preview state option for a widget */
export interface WidgetPreviewState {
  /** State identifier */
  id: string;
  /** Display label for the toggle */
  label: string;
  /** Description of what this state represents */
  description: string;
}

/** Widget category definition */
export interface WidgetCategory {
  /** Category identifier */
  id: string;
  /** Display name */
  name: string;
  /** Widget IDs in this category */
  widgets: string[];
}

/** Terminal background theme definition */
export interface TerminalTheme {
  /** Theme identifier */
  id: string;
  /** Display name */
  name: string;
  /** Background color (hex) */
  bg: string;
  /** Foreground/text color (hex) */
  fg: string;
}

/** Terminal color palette info (for dropdown and color preview) */
export interface TerminalPaletteInfo {
  /** Palette identifier */
  id: string;
  /** Display name (e.g., "xterm", "VGA", "Ubuntu") */
  name: string;
  /** ANSI code to hex color mapping */
  colors?: Record<number, string>;
}

/** Request body for preview generation */
export interface PreviewRequest {
  /** Settings to use for preview */
  settings: Settings;
  /** Terminal width in columns */
  terminalWidth: number;
  /** Override states for widgets (for N/A toggles) */
  widgetStates?: Record<string, string>;
  /** Terminal color palette ID (e.g., 'xterm', 'vga', 'ubuntu') */
  terminalPalette?: string;
}

/** Response from preview endpoint */
export interface PreviewResponse {
  /** Rendered HTML for each row */
  rows: string[];
  /** Raw ANSI output (for debugging) */
  ansi?: string[];
  /** Claude Code context information */
  statusInfo?: {
    model?: string;
    contextWindow?: {
      current: number;
      total: number;
      percentage: number;
    };
    outputStyle?: string;
    vimMode?: string;
    directory?: string;
    gitBranch?: string;
  };
}

/** API response wrapper */
export interface APIResponse<T> {
  /** Whether the request succeeded */
  success: boolean;
  /** Response data (if success) */
  data?: T;
  /** Error message (if failure) */
  error?: string;
}

/** GET /api/widgets response */
export interface WidgetsResponse {
  /** Available widgets */
  widgets: WidgetMetadata[];
  /** Widget categories */
  categories: WidgetCategory[];
  /** Available terminal background themes */
  themes: TerminalTheme[];
  /** Available terminal color palettes */
  terminalPalettes?: TerminalPaletteInfo[];
  /** Full widget schemas (for config panel) */
  widgetSchemas?: WidgetSchema[];
}
