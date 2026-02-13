/**
 * Widget schema type definitions
 *
 * Defines the complete metadata for a widget, serving as the single source
 * of truth for:
 * - GUI palette display (name, description, category)
 * - Category grouping (derived from schema.meta.category)
 * - Config panel rendering (colors, options)
 * - Default values (labels, colors)
 *
 * Each widget exports its own schema alongside its implementation,
 * eliminating the need to maintain separate metadata files.
 */

import type { ColorValue } from './colors.type.js';
import type { GitInfo } from './git.interface.js';
import type { StatusJSON } from './status-json.schema.js';
import type { UsageCache } from './usage-data.interface.js';

/** Category IDs - widgets group themselves into these */
export type WidgetCategoryId = 'environment' | 'layout' | 'git' | 'model' | 'tokens' | 'limits' | 'context' | 'session';

/**
 * Mock data fragments that a preview state contributes to the preview context.
 *
 * Each widget's preview state can supply partial data for status, usage,
 * and/or gitInfo. The preview engine merges fragments from all active
 * widget states into a complete RenderContext.
 */
export interface WidgetMockData {
  /** Partial StatusJSON fields this state sets (e.g., current_dir, model) */
  status?: Partial<StatusJSON>;
  /** Partial UsageCache fields, or null to indicate no OAuth */
  usage?: Partial<UsageCache> | null;
  /** Git repository info, or null for "not a repo" */
  gitInfo?: GitInfo | null;
}

/** Preview state for the config GUI (simulates different widget states) */
export interface PreviewState {
  /** State identifier used internally */
  id: string;
  /** Display label in the dropdown */
  label: string;
  /** Description of what this state represents */
  description: string;
  /** Mock data this state contributes to the preview context */
  mockData?: WidgetMockData;
}

/** Color option with state-based semantics (e.g., "clean branch" = green) */
export interface StateColorOption {
  /** Key used in options.colors object */
  key: string;
  /** Display label in the config panel */
  label: string;
  /** Default color value */
  default: ColorValue;
}

/** Generic config option types */
export type ConfigOptionType = 'select' | 'checkbox' | 'color' | 'text';

/** Base interface for config options */
interface ConfigOptionBase {
  /** Key used in options object */
  key: string;
  /** Display label in the config panel */
  label: string;
  /** Option type */
  type: ConfigOptionType;
}

/** Select dropdown option */
export interface SelectConfigOption extends ConfigOptionBase {
  type: 'select';
  /** Available choices */
  options: Array<{ value: string; label: string }>;
  /** Default selected value */
  default: string;
}

/** Checkbox toggle option */
export interface CheckboxConfigOption extends ConfigOptionBase {
  type: 'checkbox';
  /** Default checked state */
  default: boolean;
}

/** Color picker option */
export interface ColorConfigOption extends ConfigOptionBase {
  type: 'color';
  /** Default color */
  default: ColorValue;
}

/** Text input option */
export interface TextConfigOption extends ConfigOptionBase {
  type: 'text';
  /** Default text value */
  default: string;
  /** Maximum length (optional, enforced in GUI) */
  maxLength?: number;
  /** Placeholder text (optional) */
  placeholder?: string;
}

/** Union type for all config option types */
export type ConfigOption = SelectConfigOption | CheckboxConfigOption | ColorConfigOption | TextConfigOption;

/** Bar color configuration for usage widgets */
export interface BarColorConfig {
  /** Color when usage is 0-49% */
  low?: ColorValue;
  /** Color when usage is 50-79% */
  medium?: ColorValue;
  /** Color when usage is 80-100% */
  high?: ColorValue;
}

// =============================================================================
// Nested Schema Types
// =============================================================================

/**
 * Widget metadata - identity and categorization
 */
export interface WidgetMeta {
  /** Human-readable display name (e.g., 'Git Branch') */
  displayName: string;
  /** Brief description of what the widget shows */
  description: string;
  /** Category this widget belongs to - determines palette grouping */
  category: WidgetCategoryId;
}

/**
 * Content color options
 */
export interface WidgetContentOptions {
  /**
   * Default color for the widget content (for simple widgets).
   * Used when no state-based colors are defined.
   */
  color?: ColorValue;
  /**
   * State-based color options (e.g., git states, vim modes).
   * When defined, these provide state-specific color choices.
   */
  stateColors?: StateColorOption[];
}

/**
 * Usage bar configuration options
 */
export interface WidgetBarOptions {
  /** Whether this widget displays a usage bar */
  enabled?: boolean;
  /** Default bar gradient colors (low/medium/high thresholds) */
  colors?: BarColorConfig;
}

/**
 * All widget options grouped together
 */
export interface WidgetOptions {
  /** Content color configuration */
  content?: WidgetContentOptions;
  /** Usage bar configuration */
  bar?: WidgetBarOptions;
  /** Widget-specific configuration options (checkboxes, selects, etc.) */
  custom?: ConfigOption[];
}

/**
 * Complete widget schema - ALL metadata needed for:
 * - GUI palette display
 * - Category grouping
 * - Config panel rendering
 * - Default values
 *
 * @example
 * const MyWidgetSchema: WidgetSchema = {
 *   id: 'myWidget',
 *   meta: {
 *     displayName: 'My Widget',
 *     description: 'Shows something useful',
 *     category: 'usage',
 *   },
 *   options: {
 *     content: { color: 'cyan' },
 *     bar: { enabled: true, colors: { low: 'green', medium: 'yellow', high: 'red' } },
 *     custom: [{ key: 'showPercent', type: 'checkbox', label: 'Show %', default: true }],
 *   },
 *   previewStates: [
 *     { id: 'low', label: 'Low', description: 'Low usage' },
 *   ],
 * };
 */
export interface WidgetSchema {
  /** Unique widget identifier (e.g., 'gitBranch') */
  id: string;

  /** Widget metadata (display name, description, category) */
  meta: WidgetMeta;

  /** Widget configuration options */
  options?: WidgetOptions;

  /** Different states to preview in the GUI (e.g., clean/dirty for git) */
  previewStates?: PreviewState[];
}
