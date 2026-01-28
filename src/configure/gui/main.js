/**
 * Configuration GUI - Main Application
 *
 * Vanilla JavaScript implementation for the configuration interface.
 * No external dependencies required.
 */

// ============================================================================
// State Management
// ============================================================================

const state = {
  settings: null,
  widgets: [],
  categories: [],
  themes: [],
  terminalPalettes: [],
  widgetStates: {},
  terminalWidth: 80,
  theme: 'dark', // VS Code Dark background
  terminalPalette: 'vscode', // VS Code terminal colors
  isDirty: false,
  // Claude Code context simulation
  claudeContext: {
    contextType: 'file', // 'none', 'file', 'selection', or 'autocompact'
    fileName: 'statusline-settings.json',
    lineCount: 13,
    autocompactPercent: 5,
    showPlanMode: true,
  },
};

// ============================================================================
// API Client
// ============================================================================

async function apiGet(endpoint) {
  const response = await fetch(`/api${endpoint}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}

async function apiPut(endpoint, body) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}

async function apiPost(endpoint, body) {
  const response = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'API error');
  return data.data;
}

// ============================================================================
// Default Widget States
// ============================================================================

const DEFAULT_WIDGET_STATES = {
  directory: 'short',
  gitBranch: 'clean',
  model: 'sonnet',
  outputStyle: 'concise',
  contextUsage: 'low',
  sessionUsage: 'low',
  weeklyUsage: 'low',
  weeklySonnet: 'low',
  vimMode: 'normal',
};

// ============================================================================
// Default Layout (2 rows)
// ============================================================================

const DEFAULT_ROWS = [
  { widgets: ['directory', 'gitBranch', 'model', 'outputStyle', 'vimMode'] },
  { widgets: ['contextUsage', 'sessionUsage', 'weeklyUsage', 'weeklySonnet'] },
];

// ============================================================================
// Initialization
// ============================================================================

async function init() {
  try {
    // Load data from API
    const [settings, widgetData] = await Promise.all([
      apiGet('/settings'),
      apiGet('/widgets'),
    ]);

    state.widgets = widgetData.widgets;
    state.categories = widgetData.categories;
    state.themes = widgetData.themes;
    state.terminalPalettes = widgetData.terminalPalettes || [];
    state.widgetStates = { ...DEFAULT_WIDGET_STATES };

    // Populate terminal palette dropdown
    populateTerminalDropdown();

    // Use loaded settings, check if rows exist and have content
    if (settings.rows && settings.rows.length > 0) {
      state.settings = settings;
      console.log('Loaded settings with rows:', settings.rows);
    } else {
      // No rows in settings, use defaults
      state.settings = {
        ...settings,
        rows: JSON.parse(JSON.stringify(DEFAULT_ROWS)),
      };
      console.log('Using default rows');
    }

    // Render UI
    renderWidgetPalette();
    renderRowEditor();
    renderStateToggles();
    await updatePreview();

    // Setup event listeners
    setupEventListeners();

  } catch (error) {
    console.error('Failed to initialize:', error);
    showStatus('Failed to load configuration', 'error');
  }
}

// ============================================================================
// Rendering
// ============================================================================

function renderWidgetPalette() {
  const container = document.getElementById('widget-palette');
  container.innerHTML = '';

  for (const category of state.categories) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'palette-category';

    const nameEl = document.createElement('div');
    nameEl.className = 'palette-category-name';
    nameEl.textContent = category.name;
    categoryEl.appendChild(nameEl);

    const widgetsEl = document.createElement('div');
    widgetsEl.className = 'palette-widgets';

    for (const widgetId of category.widgets) {
      const widget = state.widgets.find((w) => w.id === widgetId);
      if (!widget) continue;

      const widgetEl = createWidgetItem(widget);
      widgetsEl.appendChild(widgetEl);
    }

    categoryEl.appendChild(widgetsEl);
    container.appendChild(categoryEl);
  }
}

function createWidgetItem(widget) {
  const el = document.createElement('div');
  el.className = 'widget-item';
  el.draggable = true;
  el.dataset.widgetId = widget.id;

  el.innerHTML = `
    <div class="widget-item-info">
      <div class="widget-item-name">${widget.name}</div>
      <div class="widget-item-desc">${widget.description}</div>
    </div>
  `;

  // Drag events
  el.addEventListener('dragstart', (e) => handleDragStart(e, widget.id, 'palette'));
  el.addEventListener('dragend', handleDragEnd);

  return el;
}

function renderRowEditor() {
  const container = document.getElementById('row-editor');
  container.innerHTML = '';

  const rows = state.settings.rows || [];

  rows.forEach((row, index) => {
    const rowEl = createRowElement(row, index);
    container.appendChild(rowEl);
  });

  // Add empty state if no rows
  if (rows.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'row-container';
    emptyEl.innerHTML = '<span class="row-empty-hint">Click "Add Row" to create a row</span>';
    container.appendChild(emptyEl);
  }
}

function createRowElement(row, index) {
  const el = document.createElement('div');
  el.className = 'row-container';
  el.dataset.rowIndex = index;

  const labelEl = document.createElement('div');
  labelEl.className = 'row-label';
  labelEl.textContent = `Row ${index + 1}`;
  el.appendChild(labelEl);

  const widgetsEl = document.createElement('div');
  widgetsEl.className = 'row-widgets';
  widgetsEl.dataset.rowIndex = index;

  // Render widgets in this row
  for (const widgetId of row.widgets) {
    const widget = state.widgets.find((w) => w.id === widgetId);
    if (!widget) continue;

    const widgetEl = createRowWidget(widget, index);
    widgetsEl.appendChild(widgetEl);
  }

  // Empty state
  if (row.widgets.length === 0) {
    const hintEl = document.createElement('span');
    hintEl.className = 'row-empty-hint';
    hintEl.textContent = 'Drag widgets here';
    widgetsEl.appendChild(hintEl);
  }

  el.appendChild(widgetsEl);

  // Row actions
  const actionsEl = document.createElement('div');
  actionsEl.className = 'row-actions';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'row-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.title = 'Delete row';
  deleteBtn.addEventListener('click', () => deleteRow(index));
  actionsEl.appendChild(deleteBtn);

  el.appendChild(actionsEl);

  // Drop zone events
  el.addEventListener('dragover', handleDragOver);
  el.addEventListener('dragleave', handleDragLeave);
  el.addEventListener('drop', (e) => handleDrop(e, index));

  return el;
}

function createRowWidget(widget, rowIndex) {
  const el = document.createElement('div');
  el.className = 'row-widget';
  el.draggable = true;
  el.dataset.widgetId = widget.id;
  el.dataset.rowIndex = rowIndex;

  const nameEl = document.createElement('span');
  nameEl.textContent = widget.name;
  el.appendChild(nameEl);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'row-widget-remove';
  removeBtn.innerHTML = '&times;';
  removeBtn.title = 'Remove widget';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeWidgetFromRow(widget.id, rowIndex);
  });
  el.appendChild(removeBtn);

  // Drag events for reordering
  el.addEventListener('dragstart', (e) => handleDragStart(e, widget.id, 'row', rowIndex));
  el.addEventListener('dragend', handleDragEnd);

  return el;
}

function renderStateToggles() {
  const container = document.getElementById('state-toggles');
  container.innerHTML = '';

  for (const widget of state.widgets) {
    if (!widget.previewStates || widget.previewStates.length === 0) continue;

    const toggleEl = document.createElement('div');
    toggleEl.className = 'state-toggle';

    const labelEl = document.createElement('label');
    labelEl.className = 'state-toggle-label';
    labelEl.textContent = widget.name;
    labelEl.htmlFor = `state-${widget.id}`;
    toggleEl.appendChild(labelEl);

    const selectEl = document.createElement('select');
    selectEl.className = 'select state-toggle-select';
    selectEl.id = `state-${widget.id}`;
    selectEl.dataset.widgetId = widget.id;

    for (const ps of widget.previewStates) {
      const optionEl = document.createElement('option');
      optionEl.value = ps.id;
      optionEl.textContent = ps.label;
      if (state.widgetStates[widget.id] === ps.id) {
        optionEl.selected = true;
      }
      selectEl.appendChild(optionEl);
    }

    selectEl.addEventListener('change', (e) => {
      state.widgetStates[widget.id] = e.target.value;
      updatePreview();
    });

    toggleEl.appendChild(selectEl);
    container.appendChild(toggleEl);
  }
}

// ============================================================================
// Terminal Palette
// ============================================================================

function populateTerminalDropdown() {
  const select = document.getElementById('terminal-select');
  if (!select) return;

  select.innerHTML = '';

  for (const palette of state.terminalPalettes) {
    const option = document.createElement('option');
    option.value = palette.id;
    option.textContent = palette.name;
    if (palette.id === state.terminalPalette) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

function updateTerminalPalette(paletteId) {
  state.terminalPalette = paletteId;
  updatePreview();
}

// ============================================================================
// Preview
// ============================================================================

async function updatePreview() {
  try {
    const result = await apiPost('/preview', {
      settings: state.settings,
      terminalWidth: state.terminalWidth,
      widgetStates: state.widgetStates,
      terminalPalette: state.terminalPalette,
    });

    // Update terminal width display
    const terminalPreview = document.getElementById('terminal-preview');
    terminalPreview.style.width = `${state.terminalWidth}ch`;

    // Render statusline rows in the left column
    const leftColumn = document.getElementById('terminal-left');
    leftColumn.innerHTML = '';

    for (let i = 0; i < result.rows.length; i++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'preview-row';
      rowEl.id = `preview-row-${i}`;
      rowEl.innerHTML = (result.rows[i] || '').trim() || '&nbsp;';
      leftColumn.appendChild(rowEl);
    }

    // Render Claude Code context in the right column
    renderClaudeContext();

    // Render plan mode footer
    renderPlanModeFooter();

  } catch (error) {
    console.error('Failed to update preview:', error);
  }
}

/**
 * Render Claude Code context (file, line selection, or autocompact) in the right column
 */
function renderClaudeContext() {
  const rightColumn = document.getElementById('terminal-right');
  rightColumn.innerHTML = '';

  const { contextType, fileName, lineCount, autocompactPercent } = state.claudeContext;

  if (contextType === 'none') {
    return;
  }

  const contextDiv = document.createElement('div');
  contextDiv.className = 'claude-context';

  if (contextType === 'file' && fileName) {
    const fileItem = document.createElement('div');
    fileItem.className = 'context-item';
    fileItem.innerHTML = `<span class="context-icon">&#x29C9;</span> <span class="context-file">In ${escapeHtml(fileName).replace(/-/g, '\u2011')}</span>`;
    contextDiv.appendChild(fileItem);
  } else if (contextType === 'selection' && lineCount > 0) {
    const lineItem = document.createElement('div');
    lineItem.className = 'context-item';
    lineItem.innerHTML = `<span class="context-icon">&#x29C9;</span> <span class="context-selection">${lineCount} lines selected</span>`;
    contextDiv.appendChild(lineItem);
  } else if (contextType === 'autocompact') {
    const compactItem = document.createElement('div');
    compactItem.className = 'context-item';
    compactItem.innerHTML = `<span class="context-autocompact">Context left until auto\u2011compact: ${autocompactPercent}%</span>`;
    contextDiv.appendChild(compactItem);
  }

  rightColumn.appendChild(contextDiv);
}

/**
 * Render plan mode indicator in the footer
 */
function renderPlanModeFooter() {
  const footer = document.getElementById('terminal-footer');
  footer.innerHTML = '';

  if (!state.claudeContext.showPlanMode) {
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  const planDiv = document.createElement('div');
  planDiv.className = 'plan-mode';
  planDiv.innerHTML = `<span class="plan-icon">&#x23F8;</span> plan mode on <span class="plan-hint">(shift+Tab to cycle)</span>`;
  footer.appendChild(planDiv);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// Drag and Drop
// ============================================================================

let dragData = null;

function handleDragStart(e, widgetId, source, sourceRowIndex = null) {
  dragData = { widgetId, source, sourceRowIndex };
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', widgetId);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  dragData = null;

  // Remove all drag-over states
  document.querySelectorAll('.drag-over').forEach((el) => {
    el.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetRowIndex) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (!dragData) return;

  const { widgetId, source, sourceRowIndex } = dragData;

  if (source === 'palette') {
    // Add widget from palette to row
    addWidgetToRow(widgetId, targetRowIndex);
  } else if (source === 'row') {
    // Move widget between/within rows
    moveWidget(widgetId, sourceRowIndex, targetRowIndex);
  }

  dragData = null;
}

// ============================================================================
// Row Operations
// ============================================================================

function addRow() {
  if (!state.settings.rows) {
    state.settings.rows = [];
  }
  state.settings.rows.push({ widgets: [] });
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

function deleteRow(index) {
  if (!state.settings.rows) return;
  state.settings.rows.splice(index, 1);
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

function addWidgetToRow(widgetId, rowIndex) {
  if (!state.settings.rows || !state.settings.rows[rowIndex]) return;

  // Don't add duplicate widgets
  if (state.settings.rows[rowIndex].widgets.includes(widgetId)) {
    showStatus('Widget already in this row', 'error');
    return;
  }

  state.settings.rows[rowIndex].widgets.push(widgetId);
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

function removeWidgetFromRow(widgetId, rowIndex) {
  if (!state.settings.rows || !state.settings.rows[rowIndex]) return;

  const widgets = state.settings.rows[rowIndex].widgets;
  const index = widgets.indexOf(widgetId);
  if (index !== -1) {
    widgets.splice(index, 1);
    state.isDirty = true;
    renderRowEditor();
    updatePreview();
  }
}

function moveWidget(widgetId, sourceRowIndex, targetRowIndex) {
  if (!state.settings.rows) return;

  const sourceRow = state.settings.rows[sourceRowIndex];
  const targetRow = state.settings.rows[targetRowIndex];

  if (!sourceRow || !targetRow) return;

  // Remove from source
  const sourceIndex = sourceRow.widgets.indexOf(widgetId);
  if (sourceIndex !== -1) {
    sourceRow.widgets.splice(sourceIndex, 1);
  }

  // Add to target (if not duplicate)
  if (!targetRow.widgets.includes(widgetId)) {
    targetRow.widgets.push(widgetId);
  }

  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

// ============================================================================
// Settings Operations
// ============================================================================

async function saveSettings() {
  try {
    await apiPut('/settings', state.settings);
    state.isDirty = false;
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

function resetToDefaults() {
  if (!confirm('Reset to default settings? This will clear your customizations.')) {
    return;
  }

  state.settings = {
    widgets: {},
    separator: '|',
    cacheTtl: 300000,
    rows: JSON.parse(JSON.stringify(DEFAULT_ROWS)),
  };
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
  showStatus('Reset to defaults', 'success');
}

// ============================================================================
// UI Helpers
// ============================================================================

function showStatus(message, type = 'success') {
  const el = document.getElementById('status-message');
  el.textContent = message;
  el.className = `status-message visible ${type}`;

  setTimeout(() => {
    el.classList.remove('visible');
  }, 3000);
}

function updateTheme(themeId) {
  const preview = document.getElementById('terminal-preview');
  preview.className = `terminal-preview theme-${themeId}`;
  state.theme = themeId;
}

function updateTerminalWidth(width) {
  state.terminalWidth = width;
  updatePreview();
}

// ============================================================================
// Event Listeners
// ============================================================================

function setupEventListeners() {
  // Terminal palette select
  const terminalSelect = document.getElementById('terminal-select');
  if (terminalSelect) {
    terminalSelect.addEventListener('change', (e) => updateTerminalPalette(e.target.value));
  }

  // Theme (background) select
  const themeSelect = document.getElementById('theme-select');
  themeSelect.addEventListener('change', (e) => updateTheme(e.target.value));

  // Width input - listen for both change and input events
  const widthInput = document.getElementById('width-input');
  widthInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 40 && val <= 200) {
      updateTerminalWidth(val);
    }
  });
  widthInput.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10) || 80;
    e.target.value = Math.max(40, Math.min(200, val));
    updateTerminalWidth(parseInt(e.target.value, 10));
  });

  // Add row button
  const addRowBtn = document.getElementById('add-row-btn');
  addRowBtn.addEventListener('click', addRow);

  // Save button
  const saveBtn = document.getElementById('save-btn');
  saveBtn.addEventListener('click', saveSettings);

  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn.addEventListener('click', resetToDefaults);

  // Warn on unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (state.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Claude Code context toggles
  setupClaudeContextListeners();
}

/**
 * Setup event listeners for Claude Code context simulation
 */
function setupClaudeContextListeners() {
  // Context type radio buttons
  const contextRadios = document.querySelectorAll('input[name="context-type"]');
  contextRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      state.claudeContext.contextType = e.target.value;
      renderClaudeContext();
    });
  });

  // File name input
  const fileContextName = document.getElementById('file-context-name');
  if (fileContextName) {
    fileContextName.addEventListener('input', (e) => {
      state.claudeContext.fileName = e.target.value;
      renderClaudeContext();
    });
  }

  // Line count input
  const lineSelectionCount = document.getElementById('line-selection-count');
  if (lineSelectionCount) {
    lineSelectionCount.addEventListener('input', (e) => {
      state.claudeContext.lineCount = parseInt(e.target.value, 10) || 0;
      renderClaudeContext();
    });
  }

  // Autocompact percentage input
  const autocompactPercent = document.getElementById('autocompact-percent');
  if (autocompactPercent) {
    autocompactPercent.addEventListener('input', (e) => {
      state.claudeContext.autocompactPercent = parseInt(e.target.value, 10) || 5;
      renderClaudeContext();
    });
  }

  // Plan mode checkbox
  const showPlanMode = document.getElementById('show-plan-mode');
  if (showPlanMode) {
    showPlanMode.addEventListener('change', (e) => {
      state.claudeContext.showPlanMode = e.target.checked;
      renderPlanModeFooter();
    });
  }
}

// ============================================================================
// Start
// ============================================================================

document.addEventListener('DOMContentLoaded', init);
