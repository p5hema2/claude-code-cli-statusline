/**
 * Preview Module
 *
 * Handles terminal preview rendering and settings operations.
 */

import { state, DEFAULT_ROWS } from './state.js';
import { apiPost, apiPut } from './api.js';
import { renderRowEditor } from './row-editor.js';
import { hideConfigPanel, showConfigPanel } from './config-panel.js';

// ============================================================================
// Preview
// ============================================================================

export async function updatePreview() {
  try {
    const result = await apiPost('/preview', {
      settings: state.settings,
      terminalWidth: state.terminalWidth,
      widgetStates: state.widgetStates,
      terminalPalette: state.terminalPalette,
    });

    const terminalPreview = document.getElementById('terminal-preview');
    terminalPreview.style.width = `${state.terminalWidth}ch`;

    const leftColumn = document.getElementById('terminal-left');
    leftColumn.innerHTML = '';

    for (let i = 0; i < result.rows.length; i++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'preview-row';
      rowEl.id = `preview-row-${i}`;
      rowEl.innerHTML = (result.rows[i] || '').trim() || '&nbsp;';
      leftColumn.appendChild(rowEl);
    }

    renderClaudeContext();
    renderPlanModeFooter();

    // Announce preview update to screen readers (WCAG 2.0 accessibility)
    const announcer = document.getElementById('preview-announcer');
    if (announcer) {
      announcer.textContent = 'Preview updated';
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }

  } catch (error) {
    console.error('Failed to update preview:', error);
  }
}

function renderClaudeContext() {
  const rightColumn = document.getElementById('terminal-right');
  rightColumn.innerHTML = '';

  const { contextType, fileName, lineCount, autocompactPercent } = state.claudeContext;

  // Hide terminal-right when no context is selected
  if (contextType === 'none') {
    rightColumn.style.display = 'none';
    return;
  }

  // Show terminal-right for all other context types
  rightColumn.style.display = 'block';

  const contextDiv = document.createElement('div');
  contextDiv.className = 'claude-context';

  if (contextType === 'file' && fileName) {
    contextDiv.innerHTML = `<div class="context-item"><span class="context-icon">&#x29C9;</span> <span class="context-file">In ${escapeHtml(fileName).replace(/-/g, '\u2011')}</span></div>`;
  } else if (contextType === 'selection' && lineCount > 0) {
    contextDiv.innerHTML = `<div class="context-item"><span class="context-icon">&#x29C9;</span> <span class="context-selection">${lineCount} lines selected</span></div>`;
  } else if (contextType === 'autocompact') {
    contextDiv.innerHTML = `<div class="context-item"><span class="context-autocompact">Context left until auto\u2011compact: ${autocompactPercent}%</span></div>`;
  }

  rightColumn.appendChild(contextDiv);
}

function renderPlanModeFooter() {
  const footer = document.getElementById('terminal-footer');
  footer.innerHTML = '';

  if (!state.claudeContext.showPlanMode) {
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  footer.innerHTML = `<div class="plan-mode"><span class="plan-icon">&#x23F8;</span> plan mode on <span class="plan-hint">(shift+Tab to cycle)</span></div>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Terminal Settings
// ============================================================================

export function populateTerminalDropdown() {
  const select = document.getElementById('terminal-select');
  if (!select) return;

  select.innerHTML = '';
  for (const palette of state.terminalPalettes) {
    const option = document.createElement('option');
    option.value = palette.id;
    option.textContent = palette.name;
    if (palette.id === state.terminalPalette) option.selected = true;
    select.appendChild(option);
  }
}

export function updateTerminalPalette(paletteId) {
  state.terminalPalette = paletteId;
  updatePreview();
  if (state.selectedInstance) showConfigPanel();
}

export function updateTheme(themeId) {
  const preview = document.getElementById('terminal-preview');
  preview.className = `terminal-preview theme-${themeId}`;
  state.theme = themeId;
}

export function updateTerminalWidth(width) {
  state.terminalWidth = width;
  updatePreview();
}

// ============================================================================
// Settings Operations
// ============================================================================

export async function saveSettings() {
  try {
    await apiPut('/settings', state.settings);
    state.isDirty = false;
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

export function resetToDefaults() {
  state.settings = {
    cacheTtl: 60000,
    rows: JSON.parse(JSON.stringify(DEFAULT_ROWS)),
  };
  state.isDirty = true;
  state.selectedInstance = null;
  hideConfigPanel();
  renderRowEditor();
  updatePreview();
  showStatus('Reset to defaults', 'success');
}

export function showStatus(message, type = 'success') {
  const el = document.getElementById('status-message');
  el.textContent = message;
  el.className = `status-message visible ${type}`;

  // Force reflow to ensure screen readers announce the change (WCAG 2.0 accessibility)
  void el.offsetHeight;

  setTimeout(() => el.classList.remove('visible'), 3000);
}

// ============================================================================
// Claude Context
// ============================================================================

export function setupClaudeContextListeners() {
  document.querySelectorAll('input[name="context-type"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      state.claudeContext.contextType = e.target.value;
      renderClaudeContext();
    });
  });

  document.getElementById('file-context-name')?.addEventListener('input', (e) => {
    state.claudeContext.fileName = e.target.value;
    renderClaudeContext();
  });

  document.getElementById('line-selection-count')?.addEventListener('input', (e) => {
    state.claudeContext.lineCount = parseInt(e.target.value, 10) || 0;
    renderClaudeContext();
  });

  document.getElementById('autocompact-percent')?.addEventListener('input', (e) => {
    state.claudeContext.autocompactPercent = parseInt(e.target.value, 10) || 5;
    renderClaudeContext();
  });

  document.getElementById('show-plan-mode')?.addEventListener('change', (e) => {
    state.claudeContext.showPlanMode = e.target.checked;
    renderPlanModeFooter();
  });
}
