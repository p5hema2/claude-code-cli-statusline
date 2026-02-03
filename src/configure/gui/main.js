/**
 * Configuration GUI - Main Application
 *
 * Vanilla JavaScript implementation for the configuration interface.
 * No external dependencies required.
 *
 * New simplified settings structure:
 * - Settings: { cacheTtl: number, rows: WidgetConfig[][] }
 * - WidgetConfig: { widget: string, color?: string, colors?: Record, options?: Record }
 * - No global widget configuration - each instance in layout has its own config
 */

import { state, DEFAULT_WIDGET_STATES, loadStateFromLocalStorage, toggleCategoryCollapse } from './modules/state.js';
import { apiGet } from './modules/api.js';
import { migrateSettings } from './modules/migration.js';
import { renderWidgetPalette } from './modules/components.js';
import { renderRowEditor, addRow } from './modules/row-editor.js';
import { hideConfigPanel } from './modules/config-panel.js';
import {
  updatePreview,
  populateTerminalDropdown,
  updateTerminalPalette,
  updateTheme,
  updateTerminalWidth,
  saveSettings,
  resetToDefaults,
  setupClaudeContextListeners,
  showStatus,
} from './modules/preview.js';

// ============================================================================
// Initialization
// ============================================================================

async function init() {
  try {
    // Load state from localStorage first
    loadStateFromLocalStorage();

    const [rawSettings, widgetData] = await Promise.all([
      apiGet('/settings'),
      apiGet('/widgets'),
    ]);

    state.widgets = widgetData.widgets;
    state.categories = widgetData.categories;
    state.themes = widgetData.themes;
    state.terminalPalettes = widgetData.terminalPalettes || [];
    state.widgetSchemas = widgetData.widgetSchemas || [];
    state.widgetStates = { ...DEFAULT_WIDGET_STATES };

    populateTerminalDropdown();

    // Migrate and load settings
    state.settings = migrateSettings(rawSettings);
    console.log('Loaded settings:', state.settings);

    renderWidgetPalette();
    renderRowEditor();
    await updatePreview();
    setupEventListeners();

  } catch (error) {
    console.error('Failed to initialize:', error);
    showStatus('Failed to load configuration', 'error');
  }
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
  document.getElementById('config-close-btn')?.addEventListener('click', hideConfigPanel);
  document.getElementById('terminal-select')?.addEventListener('change', (e) => updateTerminalPalette(e.target.value));
  document.getElementById('theme-select')?.addEventListener('change', (e) => updateTheme(e.target.value));

  const widthInput = document.getElementById('width-input');
  widthInput?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 40 && val <= 200) updateTerminalWidth(val);
  });
  widthInput?.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10) || 80;
    e.target.value = Math.max(40, Math.min(200, val));
    updateTerminalWidth(parseInt(e.target.value, 10));
  });

  document.getElementById('add-row-btn')?.addEventListener('click', addRow);
  document.getElementById('save-btn')?.addEventListener('click', saveSettings);
  document.getElementById('reset-btn')?.addEventListener('click', resetToDefaults);

  // Category collapse toggle
  document.getElementById('widget-palette')?.addEventListener('click', (e) => {
    const toggleTarget = e.target.closest('[data-toggle-category]');
    if (toggleTarget) {
      const categoryId = toggleTarget.dataset.toggleCategory;
      const isExpanded = toggleCategoryCollapse(categoryId);

      // Update UI
      const category = document.querySelector(`[data-category-id="${categoryId}"]`);
      if (!category) return;

      const icon = category.querySelector('.category-toggle-icon');
      const content = category.querySelector('.category-content');

      if (!icon || !content) return;

      icon.textContent = isExpanded ? '▼' : '▶';

      // Toggle CSS class for animation
      if (isExpanded) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    }
  });

  window.addEventListener('beforeunload', (e) => {
    if (state.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  setupClaudeContextListeners();
}

// ============================================================================
// Start
// ============================================================================

document.addEventListener('DOMContentLoaded', init);
