/**
 * Widget categories and metadata for the configuration GUI
 *
 * Defines how widgets are grouped in the palette and their preview states
 * for simulating different N/A conditions.
 */

import type {
  WidgetMetadata,
  WidgetCategory,
  TerminalTheme,
} from '../types/ConfigureAPI.js';

/** Widget metadata definitions */
export const WIDGET_METADATA: WidgetMetadata[] = [
  {
    id: 'directory',
    name: 'Directory',
    description: 'Current working directory path',
    category: 'location',
    previewStates: [
      { id: 'short', label: 'Short Path', description: 'Show ~/project' },
      { id: 'long', label: 'Long Path', description: 'Show full path' },
    ],
  },
  {
    id: 'gitBranch',
    name: 'Git Branch',
    description: 'Git branch name with status indicators',
    category: 'location',
    previewStates: [
      { id: 'clean', label: 'Clean', description: 'No uncommitted changes' },
      { id: 'dirty', label: 'Dirty', description: 'Has uncommitted changes' },
      { id: 'notRepo', label: 'Not a Repo', description: 'Directory is not a git repository' },
    ],
  },
  {
    id: 'model',
    name: 'Model',
    description: 'Current Claude model name',
    category: 'model',
    previewStates: [
      { id: 'sonnet', label: 'Sonnet', description: 'Claude Sonnet model' },
      { id: 'opus', label: 'Opus', description: 'Claude Opus model' },
      { id: 'haiku', label: 'Haiku', description: 'Claude Haiku model' },
    ],
  },
  {
    id: 'outputStyle',
    name: 'Output Style',
    description: 'Current output style (concise, verbose, etc.)',
    category: 'model',
    previewStates: [
      { id: 'concise', label: 'Concise', description: 'Concise output style' },
      { id: 'verbose', label: 'Verbose', description: 'Verbose output style' },
      { id: 'explanatory', label: 'Explanatory', description: 'Explanatory output style' },
    ],
  },
  {
    id: 'contextUsage',
    name: 'Context Usage',
    description: 'Context window usage percentage',
    category: 'usage',
    previewStates: [
      { id: 'low', label: 'Low (20%)', description: '20% context used' },
      { id: 'medium', label: 'Medium (50%)', description: '50% context used' },
      { id: 'high', label: 'High (80%)', description: '80% context used' },
      { id: 'unavailable', label: 'Unavailable', description: 'Context info not available' },
    ],
  },
  {
    id: 'sessionUsage',
    name: 'Session Usage',
    description: 'Current session usage for OAuth users',
    category: 'usage',
    previewStates: [
      { id: 'low', label: 'Low', description: 'Low session usage' },
      { id: 'medium', label: 'Medium', description: 'Medium session usage' },
      { id: 'high', label: 'High', description: 'High session usage' },
      { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
    ],
  },
  {
    id: 'weeklyUsage',
    name: 'Weekly Usage',
    description: 'Weekly usage limit progress',
    category: 'usage',
    previewStates: [
      { id: 'low', label: 'Low', description: 'Low weekly usage' },
      { id: 'medium', label: 'Medium', description: 'Medium weekly usage' },
      { id: 'high', label: 'High', description: 'High weekly usage' },
      { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
    ],
  },
  {
    id: 'weeklySonnet',
    name: 'Weekly Sonnet',
    description: 'Weekly Sonnet model usage limit',
    category: 'usage',
    previewStates: [
      { id: 'low', label: 'Low', description: 'Low Sonnet usage' },
      { id: 'medium', label: 'Medium', description: 'Medium Sonnet usage' },
      { id: 'high', label: 'High', description: 'High Sonnet usage' },
      { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
    ],
  },
  {
    id: 'usageAge',
    name: 'Query Time',
    description: 'When usage data was last queried (absolute time)',
    category: 'usage',
    previewStates: [
      { id: 'morning', label: 'Morning', description: 'Shows @ 09:30' },
      { id: 'afternoon', label: 'Afternoon', description: 'Shows @ 14:15' },
      { id: 'evening', label: 'Evening', description: 'Shows @ 19:45' },
      { id: 'noOAuth', label: 'No OAuth', description: 'Not using OAuth authentication' },
    ],
  },
  {
    id: 'vimMode',
    name: 'Vim Mode',
    description: 'Current Vim editing mode',
    category: 'editor',
    previewStates: [
      { id: 'normal', label: 'Normal', description: 'Vim normal mode' },
      { id: 'insert', label: 'Insert', description: 'Vim insert mode' },
      { id: 'visual', label: 'Visual', description: 'Vim visual mode' },
      { id: 'disabled', label: 'Disabled', description: 'Vim mode not enabled' },
    ],
  },
];

/** Widget categories for palette grouping */
export const WIDGET_CATEGORIES: WidgetCategory[] = [
  {
    id: 'location',
    name: 'Location',
    widgets: ['directory', 'gitBranch'],
  },
  {
    id: 'model',
    name: 'Model & Style',
    widgets: ['model', 'outputStyle'],
  },
  {
    id: 'usage',
    name: 'Usage Limits',
    widgets: ['contextUsage', 'sessionUsage', 'weeklyUsage', 'weeklySonnet', 'usageAge'],
  },
  {
    id: 'editor',
    name: 'Editor',
    widgets: ['vimMode'],
  },
];

/** Terminal themes for preview background */
export const TERMINAL_THEMES: TerminalTheme[] = [
  { id: 'monokai', name: 'Monokai', bg: '#272822', fg: '#f8f8f2' },
  { id: 'dark', name: 'VS Code Dark', bg: '#1e1e1e', fg: '#d4d4d4' },
  { id: 'light', name: 'Light', bg: '#ffffff', fg: '#333333' },
  { id: 'solarized-dark', name: 'Solarized Dark', bg: '#002b36', fg: '#839496' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', fg: '#f8f8f2' },
  { id: 'nord', name: 'Nord', bg: '#2e3440', fg: '#d8dee9' },
];

/**
 * Get widget metadata by ID
 */
export function getWidgetMetadata(id: string): WidgetMetadata | undefined {
  return WIDGET_METADATA.find((w) => w.id === id);
}

/**
 * Get all widgets in a category
 */
export function getWidgetsByCategory(categoryId: string): WidgetMetadata[] {
  const category = WIDGET_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return [];
  return category.widgets
    .map((id) => getWidgetMetadata(id))
    .filter((w): w is WidgetMetadata => w !== undefined);
}
