/**
 * Settings Migration Module
 *
 * Handles migration from old settings format to new WidgetConfig format.
 */

import { DEFAULT_ROWS } from './state.js';

/**
 * Migrate old settings format to new WidgetConfig format
 */
export function migrateSettings(settings) {
  // If already in new format, return as-is
  if (isNewFormat(settings)) {
    return settings;
  }

  const result = { cacheTtl: settings.cacheTtl ?? 60000 };

  // Migrate rows
  if (Array.isArray(settings.rows) && settings.rows.length > 0) {
    const firstRow = settings.rows[0];

    // Old format: rows = [['widgetId', 'widgetId']]
    if (Array.isArray(firstRow) && typeof firstRow[0] === 'string') {
      result.rows = settings.rows.map((row) =>
        row.map((widgetId) => migrateWidgetConfig(widgetId, settings.widgets))
      );
      // Add separators between widgets
      result.rows = result.rows.map((row) => addSeparators(row));
      return result;
    }

    // Old format: rows = [{widgets: ['id']}]
    if (typeof firstRow === 'object' && 'widgets' in firstRow) {
      result.rows = settings.rows.map((row) =>
        row.widgets.map((widgetId) => migrateWidgetConfig(widgetId, settings.widgets))
      );
      result.rows = result.rows.map((row) => addSeparators(row));
      return result;
    }
  }

  // Use defaults if no valid rows
  result.rows = JSON.parse(JSON.stringify(DEFAULT_ROWS));
  return result;
}

function isNewFormat(settings) {
  if (!Array.isArray(settings.rows) || settings.rows.length === 0) return false;
  const firstRow = settings.rows[0];
  if (!Array.isArray(firstRow) || firstRow.length === 0) return false;
  return typeof firstRow[0] === 'object' && 'widget' in firstRow[0];
}

function migrateWidgetConfig(widgetId, oldWidgets) {
  const config = { widget: widgetId };
  const oldConfig = oldWidgets?.[widgetId];

  if (oldConfig?.contentColor) {
    config.color = oldConfig.contentColor;
  }
  if (oldConfig?.options?.colors) {
    config.colors = oldConfig.options.colors;
  }
  if (oldConfig?.options) {
    // eslint-disable-next-line no-unused-vars
    const { colors: _colors, ...rest } = oldConfig.options;
    if (Object.keys(rest).length > 0) {
      config.options = rest;
    }
  }

  return config;
}

function addSeparators(row) {
  if (row.length <= 1) return row;
  const result = [];
  for (let i = 0; i < row.length; i++) {
    result.push(row[i]);
    if (i < row.length - 1) {
      result.push({ widget: 'separator' });
    }
  }
  return result;
}
