/**
 * Settings management
 *
 * Loads and manages user configuration for the statusline.
 */

import { homedir } from 'node:os';
import { readFileSync, existsSync } from 'node:fs';
import type { Settings } from '../types/Settings.js';
import { DEFAULT_SETTINGS } from '../types/Settings.js';

/** Path to user settings file */
const SETTINGS_PATH = `${homedir()}/.claude/statusline-settings.json`;

/**
 * Deep merge two settings objects
 *
 * @param target - Base settings
 * @param source - Settings to merge in
 * @returns Merged settings
 */
function deepMergeSettings(
  target: Settings,
  source: Partial<Settings>
): Settings {
  const result: Settings = { ...target };

  // Merge widgets
  if (source.widgets) {
    result.widgets = { ...target.widgets };
    for (const [key, value] of Object.entries(source.widgets)) {
      if (value !== undefined) {
        result.widgets[key] = { ...target.widgets?.[key], ...value };
      }
    }
  }

  // Merge colors
  if (source.colors) {
    result.colors = { ...target.colors, ...source.colors };
  }

  // Override simple values
  if (source.separator !== undefined) result.separator = source.separator;
  if (source.cacheTtl !== undefined) result.cacheTtl = source.cacheTtl;

  return result;
}

/**
 * Load user settings from disk
 *
 * Settings are merged with defaults, so users only need to specify
 * what they want to change.
 *
 * @returns Merged settings object
 */
export function loadSettings(): Settings {
  try {
    if (existsSync(SETTINGS_PATH)) {
      const data = readFileSync(SETTINGS_PATH, 'utf-8');
      const userSettings = JSON.parse(data) as Partial<Settings>;
      return deepMergeSettings(DEFAULT_SETTINGS, userSettings);
    }
  } catch {
    // Silently fail - use defaults
  }
  return DEFAULT_SETTINGS;
}

/**
 * Check if a widget is enabled
 *
 * @param settings - Settings object
 * @param widgetName - Name of the widget to check
 * @returns True if widget is enabled
 */
export function isWidgetEnabled(settings: Settings, widgetName: string): boolean {
  const widgetConfig = settings.widgets?.[widgetName];
  return widgetConfig?.enabled !== false;
}
