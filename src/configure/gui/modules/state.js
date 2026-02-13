/**
 * State Management Module
 *
 * Central application state and helper functions.
 */

// ============================================================================
// State
// ============================================================================

export const state = {
  settings: null,
  widgets: [],
  categories: [],
  themes: [],
  terminalPalettes: [],
  widgetSchemas: [],
  widgetStates: {},
  terminalWidth: 156,
  theme: 'dark',
  terminalPalette: 'vscode',
  isDirty: false,
  // Currently selected widget instance (row index and widget index)
  selectedInstance: null, // { rowIndex: number, widgetIndex: number }
  // Claude Code context simulation
  claudeContext: {
    contextType: 'file',
    fileName: 'statusline-settings.json',
    lineCount: 13,
    autocompactPercent: 5,
    showPlanMode: true,
  },
  // Category collapse state (all expanded by default)
  categoryCollapseState: {
    environment: true,
    layout: true,
    git: true,
    model: true,
    tokens: true,
    limits: true,
    context: true,
    session: true,
  },
};

// ============================================================================
// Color Constants
// ============================================================================

export const ANSI_COLORS = [
  { value: 'dim', label: 'Dim' },
  { value: 'bold', label: 'Bold' },
  { value: 'black', label: 'Black' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'blue', label: 'Blue' },
  { value: 'magenta', label: 'Magenta' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'white', label: 'White' },
  { value: 'gray', label: 'Gray' },
  { value: 'redBright', label: 'Bright Red' },
  { value: 'greenBright', label: 'Bright Green' },
  { value: 'yellowBright', label: 'Bright Yellow' },
  { value: 'blueBright', label: 'Bright Blue' },
  { value: 'magentaBright', label: 'Bright Magenta' },
  { value: 'cyanBright', label: 'Bright Cyan' },
  { value: 'whiteBright', label: 'Bright White' },
];

export const COLOR_TO_ANSI = {
  black: 30, red: 31, green: 32, yellow: 33, blue: 34,
  magenta: 35, cyan: 36, white: 37, gray: 90,
  redBright: 91, greenBright: 92, yellowBright: 93, blueBright: 94,
  magentaBright: 95, cyanBright: 96, whiteBright: 97,
};

/** Trash bin SVG icon for delete buttons */
export const TRASH_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

// ============================================================================
// Default Values
// ============================================================================

// Default rows with WidgetConfig objects
export const DEFAULT_ROWS = [
  [
    { widget: 'directory', color: 'blue' },
    { widget: 'separator' },
    { widget: 'gitBranch' },
    { widget: 'separator' },
    { widget: 'model' },
    { widget: 'separator' },
    { widget: 'outputStyle' },
    { widget: 'separator' },
    { widget: 'vimMode' },
  ],
  [
    { widget: 'contextUsage' },
    { widget: 'separator' },
    { widget: 'sessionUsage' },
    { widget: 'separator' },
    { widget: 'weeklyUsage' },
    { widget: 'separator' },
    { widget: 'weeklySonnet' },
  ],
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getColorHex(colorName) {
  if (!colorName || colorName === 'dim' || colorName === 'bold') return null;
  const ansiCode = COLOR_TO_ANSI[colorName];
  if (!ansiCode) return null;
  const palette = state.terminalPalettes.find((p) => p.id === state.terminalPalette);
  return palette?.colors?.[ansiCode] || null;
}

export function getWidgetSchema(widgetId) {
  return state.widgetSchemas.find((s) => s.id === widgetId);
}

/**
 * Toggle category collapse state
 */
export function toggleCategoryCollapse(categoryId) {
  state.categoryCollapseState[categoryId] = !state.categoryCollapseState[categoryId];
  saveStateToLocalStorage();
  return state.categoryCollapseState[categoryId];
}

/**
 * Check if category is expanded
 */
export function isCategoryExpanded(categoryId) {
  return state.categoryCollapseState[categoryId] ?? true;
}

/**
 * Save state to localStorage
 */
function saveStateToLocalStorage() {
  try {
    const stateToSave = {
      categoryCollapseState: state.categoryCollapseState,
      terminalWidth: state.terminalWidth,
      theme: state.theme,
      terminalPalette: state.terminalPalette,
    };
    localStorage.setItem('configState', JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Failed to persist state:', error);
  }
}

/**
 * Load state from localStorage
 */
export function loadStateFromLocalStorage() {
  try {
    const saved = localStorage.getItem('configState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.categoryCollapseState) {
        state.categoryCollapseState = parsed.categoryCollapseState;
      }
      if (parsed.terminalWidth) {
        state.terminalWidth = parsed.terminalWidth;
      }
      if (parsed.theme) {
        state.theme = parsed.theme;
      }
      if (parsed.terminalPalette) {
        state.terminalPalette = parsed.terminalPalette;
      }
    }
  } catch (error) {
    console.warn('Failed to load state:', error);
  }
}
