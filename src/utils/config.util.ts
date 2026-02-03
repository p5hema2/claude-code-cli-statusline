/**
 * Settings management
 *
 * Loads and manages user configuration for the statusline.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname } from 'node:path';

import defaultSettings from '../defaults/statusline.json' with { type: 'json' };
import type { Settings, WidgetConfig } from '../types/index.js';

/** Path to user settings file */
const SETTINGS_PATH = process.env.TEST_SETTINGS_PATH || `${homedir()}/.claude/statusline-settings.json`;

// Verification: Ensure test isolation is working
if (process.env.TEST_SETTINGS_PATH) {
  const isIsolated = !SETTINGS_PATH.includes(homedir()) || SETTINGS_PATH.includes('claude-statusline-test');
  if (!isIsolated) {
    throw new Error(
      `TEST ISOLATION FAILURE: TEST_SETTINGS_PATH is set but points to user settings!\n` +
      `Expected: temp test directory\n` +
      `Got: ${SETTINGS_PATH}\n` +
      `This means the server is using real user settings instead of test settings.`
    );
  }
}

/** Default settings from JSON */
const DEFAULT_SETTINGS: Settings = defaultSettings as Settings;

/**
 * Get the settings file path
 */
export function getSettingsPath(): string {
  return SETTINGS_PATH;
}

/**
 * Get default settings
 */
export function getDefaultSettings(): Settings {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

/**
 * Legacy settings format (pre-migration)
 */
interface LegacySettings {
  widgets?: Record<string, {
    label?: string;
    labelColor?: string;
    contentColor?: string;
    options?: Record<string, unknown>;
  }>;
  rows?: Array<string[] | { widgets: string[]; align?: string }>;
  separator?: string;
  cacheTtl?: number;
  colors?: Record<string, string>;
}

/**
 * Migrate settings from old format to new format
 *
 * Handles:
 * - Old rows format: [{widgets: [...]}] → [[{widget: '...'}]]
 * - Old rows format: [['widgetId']] → [[{widget: 'widgetId'}]]
 * - Widget config migration: widgets.{id}.{label,colors} → rows config
 * - Removes obsolete fields: separator, colors, widgets
 *
 * @param settings - Settings that may be in old format
 * @returns Migrated settings in new format
 */
function migrateSettings(settings: Record<string, unknown>): Settings {
  const legacy = settings as LegacySettings;
  const result: Settings = {
    cacheTtl: legacy.cacheTtl ?? DEFAULT_SETTINGS.cacheTtl,
  };

  // Check if already in new format (rows contain objects with widget property)
  if (Array.isArray(legacy.rows) && legacy.rows.length > 0) {
    const firstRow = legacy.rows[0];

    // New format: rows = [[{widget: 'id'}]]
    if (Array.isArray(firstRow) && firstRow.length > 0) {
      const firstItem = firstRow[0];

      // Already migrated: has widget property
      if (typeof firstItem === 'object' && firstItem !== null && 'widget' in firstItem) {
        result.rows = legacy.rows as unknown as WidgetConfig[][];
        return result;
      }

      // Old simple format: rows = [['widgetId', 'widgetId']]
      if (typeof firstItem === 'string') {
        result.rows = (legacy.rows as string[][]).map((row) =>
          row.map((widgetId): WidgetConfig => {
            // Try to migrate widget config from old widgets object
            const oldConfig = legacy.widgets?.[widgetId];
            const config: WidgetConfig = { widget: widgetId };

            if (oldConfig?.contentColor) {
              config.color = oldConfig.contentColor as WidgetConfig['color'];
            }
            if (oldConfig?.options?.colors) {
              config.colors = oldConfig.options.colors as Record<string, NonNullable<WidgetConfig['color']>>;
            }
            if (oldConfig?.options) {
              // Copy options excluding colors (already handled above)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { colors: _colors, ...restOptions } = oldConfig.options as Record<string, unknown>;
              if (Object.keys(restOptions).length > 0) {
                config.options = restOptions;
              }
            }

            return config;
          })
        );
        return result;
      }
    }

    // Old object format: rows = [{widgets: ['id']}]
    if (typeof firstRow === 'object' && !Array.isArray(firstRow) && 'widgets' in firstRow) {
      const oldRows = legacy.rows as Array<{ widgets: string[] }>;
      result.rows = oldRows.map((row) =>
        row.widgets.map((widgetId): WidgetConfig => {
          const oldConfig = legacy.widgets?.[widgetId];
          const config: WidgetConfig = { widget: widgetId };

          if (oldConfig?.contentColor) {
            config.color = oldConfig.contentColor as WidgetConfig['color'];
          }
          if (oldConfig?.options?.colors) {
            config.colors = oldConfig.options.colors as Record<string, NonNullable<WidgetConfig['color']>>;
          }

          return config;
        })
      );
      return result;
    }
  }

  // No valid rows, use defaults
  result.rows = DEFAULT_SETTINGS.rows;
  return result;
}

/**
 * Load user settings from disk
 *
 * Settings are loaded and migrated from old formats if needed.
 * If no settings file exists, returns default settings.
 *
 * @returns Loaded (and possibly migrated) settings object
 */
export function loadSettings(): Settings {
  try {
    if (existsSync(SETTINGS_PATH)) {
      const data = readFileSync(SETTINGS_PATH, 'utf-8');
      const rawSettings = JSON.parse(data) as Record<string, unknown>;
      return migrateSettings(rawSettings);
    }
  } catch {
    // Silently fail - use defaults
  }
  return getDefaultSettings();
}

/**
 * Save settings to disk
 *
 * Writes the settings to the user's configuration file.
 * Creates the directory structure if it doesn't exist.
 *
 * @param settings - Settings object to save
 * @throws Error if unable to write file
 */
export function saveSettings(settings: Settings): void {
  // Ensure directory exists
  const dir = dirname(SETTINGS_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Write settings with pretty formatting
  const json = JSON.stringify(settings, null, 2);
  writeFileSync(SETTINGS_PATH, json, 'utf-8');
}
