/**
 * Schema-driven mock data utility for the configuration preview
 *
 * Instead of hardcoding mock data per widget, this utility reads
 * mockData from each widget's schema previewStates. The schema is
 * the single source of truth for both preview labels and data.
 */

import type { GitInfo, StatusJSON, UsageCache, WidgetSchema } from '../../types/index.js';
import { mockCachedEntry, mockExtraUsage } from '../../widgets/index.js';

/** Widget state overrides for preview */
export type WidgetStates = Record<string, string>;

/**
 * Derive default widget states from schemas
 *
 * Uses the first previewState of each schema as the default.
 * Schemas without previewStates (text, separator) are skipped.
 *
 * @param schemas - All widget schemas
 * @returns Default widget state map (widgetId -> first stateId)
 */
export function getDefaultWidgetStates(schemas: WidgetSchema[]): WidgetStates {
  const defaults: WidgetStates = {};
  for (const schema of schemas) {
    if (schema.previewStates && schema.previewStates.length > 0) {
      defaults[schema.id] = schema.previewStates[0].id;
    }
  }
  return defaults;
}

/** Zero-value CachedUsageEntry used as fill for missing usage fields */
const ZERO_USAGE_ENTRY = mockCachedEntry(0);

/**
 * Generate the complete mock preview context from widget states and schemas
 *
 * Merges mockData fragments from each widget's selected preview state:
 * - status: shallow Object.assign (each widget sets different top-level fields)
 * - usage: merge partial UsageCache fragments, fill missing fields with zeros.
 *   Returns null only if ALL usage contributions are null (all noOAuth).
 * - gitInfo: direct assignment (only gitBranch contributes)
 *
 * @param widgetStates - Selected state IDs per widget
 * @param schemas - All widget schemas
 * @returns Merged { status, usage, gitInfo } for the preview renderer
 */
export function generateMockContext(
  widgetStates: WidgetStates,
  schemas: WidgetSchema[],
): { status: StatusJSON; usage: UsageCache | null; gitInfo: GitInfo | null } {
  const status: StatusJSON = {};
  let usageFragments: Partial<UsageCache>[] = [];
  let allUsageNull = true;
  let hasUsageContributor = false;
  let gitInfo: GitInfo | null = null;

  for (const schema of schemas) {
    const stateId = widgetStates[schema.id];
    if (!stateId || !schema.previewStates) continue;

    const previewState = schema.previewStates.find((s) => s.id === stateId);
    if (!previewState?.mockData) continue;

    const { mockData } = previewState;

    // Deep merge status partials to handle nested objects (token_metrics, cost, etc.)
    // Previously used Object.assign which did shallow merge, causing widgets to
    // overwrite each other's nested data. Now we deep merge one level to preserve
    // all fields from multiple widgets contributing to the same nested object.
    if (mockData.status) {
      for (const [key, value] of Object.entries(mockData.status)) {
        // Guard against prototype pollution (defense-in-depth)
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Deep merge for nested objects (e.g., token_metrics, cost)
          const existing = status[key];
          status[key] = existing && typeof existing === 'object' && !Array.isArray(existing)
            ? { ...existing, ...value }
            : value;
        } else {
          // Direct assignment for primitives
          status[key] = value;
        }
      }
    }

    // Collect usage fragments
    if (mockData.usage !== undefined) {
      hasUsageContributor = true;
      if (mockData.usage === null) {
        // This widget says "no OAuth" — contributes null
      } else {
        allUsageNull = false;
        usageFragments.push(mockData.usage);
      }
    }

    // GitInfo: direct assignment (only gitBranch contributes)
    if (mockData.gitInfo !== undefined) {
      gitInfo = mockData.gitInfo;
    }
  }

  // Build final usage: null if all contributors said null, otherwise merge
  let usage: UsageCache | null = null;
  if (hasUsageContributor && !allUsageNull) {
    const merged: UsageCache = {
      timestamp: Date.now(),
      current_session: ZERO_USAGE_ENTRY,
      weekly_all: ZERO_USAGE_ENTRY,
      weekly_sonnet: ZERO_USAGE_ENTRY,
      weekly_oauth_apps: null,
      weekly_cowork: null,
      weekly_opus: null,
      extra_usage: mockExtraUsage(),
    };
    for (const fragment of usageFragments) {
      Object.assign(merged, fragment);
    }
    usage = merged;
  }

  return { status, usage, gitInfo };
}
