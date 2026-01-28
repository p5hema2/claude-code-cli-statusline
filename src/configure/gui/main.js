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
  // Currently selected widget for configuration
  selectedWidget: null,
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
// Color Constants
// ============================================================================

const ANSI_COLORS = [
  { value: '', label: 'Default' },
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

// Widget-specific configuration schemas
const WIDGET_CONFIG_SCHEMAS = {
  directory: {
    options: [
      {
        key: 'format',
        type: 'select',
        label: 'Path Format',
        options: [
          { value: 'shortened', label: 'Shortened (~/p/c/src)' },
          { value: 'full', label: 'Full Path' },
          { value: 'project-only', label: 'Project Name Only' },
        ],
        default: 'shortened',
      },
    ],
  },
  gitBranch: {
    colorOptions: [
      { key: 'clean', label: 'Clean Branch', default: 'green' },
      { key: 'dirty', label: 'Dirty Branch', default: 'yellow' },
      { key: 'ahead', label: 'Ahead of Remote', default: 'cyan' },
      { key: 'behind', label: 'Behind Remote', default: 'red' },
      { key: 'detached', label: 'Detached HEAD', default: 'yellow' },
    ],
    options: [
      { key: 'indicatorColor', type: 'color', label: 'Indicator Color', default: 'red' },
    ],
  },
  vimMode: {
    colorOptions: [
      { key: 'normal', label: 'Normal Mode', default: 'green' },
      { key: 'insert', label: 'Insert Mode', default: 'yellow' },
      { key: 'visual', label: 'Visual Mode', default: 'magenta' },
      { key: 'replace', label: 'Replace Mode', default: 'red' },
      { key: 'command', label: 'Command Mode', default: 'blue' },
    ],
  },
  model: {
    colorOptions: [
      { key: 'opus', label: 'Opus Model', default: 'magenta' },
      { key: 'sonnet', label: 'Sonnet Model', default: 'magenta' },
      { key: 'haiku', label: 'Haiku Model', default: 'magenta' },
    ],
  },
  outputStyle: {
    colorOptions: [
      { key: 'concise', label: 'Concise Style', default: 'cyan' },
      { key: 'verbose', label: 'Verbose Style', default: 'cyan' },
      { key: 'explanatory', label: 'Explanatory Style', default: 'cyan' },
    ],
  },
  usageAge: {
    options: [
      { key: 'iconColor', type: 'color', label: 'Icon Color', default: 'dim' },
      { key: 'timeColor', type: 'color', label: 'Time Color', default: 'gray' },
    ],
  },
  contextUsage: {
    barColorOptions: true,
  },
  sessionUsage: {
    barColorOptions: true,
    options: [
      { key: 'showResetTime', type: 'checkbox', label: 'Show Reset Time', default: true },
    ],
  },
  weeklyUsage: {
    barColorOptions: true,
    options: [
      { key: 'showResetTime', type: 'checkbox', label: 'Show Reset Time', default: true },
    ],
  },
  weeklySonnet: {
    barColorOptions: true,
    options: [
      { key: 'showResetTime', type: 'checkbox', label: 'Show Reset Time', default: true },
    ],
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

  // Highlight if this is the selected widget
  if (state.selectedWidget === widget.id) {
    el.classList.add('selected');
  }

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

  // Click to configure
  el.addEventListener('click', (e) => {
    // Don't trigger if clicking the remove button
    if (e.target.classList.contains('row-widget-remove')) return;
    selectWidget(widget.id, rowIndex);
  });

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
// Widget Configuration Panel
// ============================================================================

/**
 * Select a widget to show its configuration panel
 */
function selectWidget(widgetId, rowIndex) {
  // Deselect previous widget
  document.querySelectorAll('.row-widget.selected').forEach((el) => {
    el.classList.remove('selected');
  });

  // If clicking the same widget, deselect it
  if (state.selectedWidget === widgetId) {
    state.selectedWidget = null;
    hideConfigPanel();
    return;
  }

  state.selectedWidget = widgetId;

  // Highlight the selected widget
  const widgetEl = document.querySelector(
    `.row-widget[data-widget-id="${widgetId}"][data-row-index="${rowIndex}"]`
  );
  if (widgetEl) {
    widgetEl.classList.add('selected');
  }

  showConfigPanel(widgetId);
}

/**
 * Show the configuration panel for a widget
 */
function showConfigPanel(widgetId) {
  const panel = document.getElementById('widget-config-panel');
  const title = document.getElementById('config-widget-title');
  const content = document.getElementById('config-content');
  const editorArea = document.querySelector('.editor-area');

  const widget = state.widgets.find((w) => w.id === widgetId);
  if (!widget) return;

  title.textContent = `${widget.name} Settings`;
  content.innerHTML = '';

  // Ensure widget config exists in settings
  if (!state.settings.widgets) {
    state.settings.widgets = {};
  }
  if (!state.settings.widgets[widgetId]) {
    state.settings.widgets[widgetId] = { enabled: true };
  }

  const widgetConfig = state.settings.widgets[widgetId];

  // Common config: Label
  content.appendChild(createLabelConfig(widgetId, widgetConfig));

  // Common config: Colors
  content.appendChild(createCommonColorConfig(widgetId, widgetConfig));

  // Widget-specific config
  const schema = WIDGET_CONFIG_SCHEMAS[widgetId];
  if (schema) {
    // State-based color options (e.g., git branch states, vim modes)
    if (schema.colorOptions) {
      content.appendChild(createStateColorConfig(widgetId, widgetConfig, schema.colorOptions));
    }

    // Usage bar color options
    if (schema.barColorOptions) {
      content.appendChild(createBarColorConfig(widgetId, widgetConfig));
    }

    // Other widget-specific options
    if (schema.options) {
      content.appendChild(createWidgetOptions(widgetId, widgetConfig, schema.options));
    }
  }

  panel.classList.remove('hidden');
  editorArea.classList.add('has-config');
}

/**
 * Hide the configuration panel
 */
function hideConfigPanel() {
  const panel = document.getElementById('widget-config-panel');
  const editorArea = document.querySelector('.editor-area');

  panel.classList.add('hidden');
  editorArea.classList.remove('has-config');

  document.querySelectorAll('.row-widget.selected').forEach((el) => {
    el.classList.remove('selected');
  });

  state.selectedWidget = null;
}

/**
 * Create label configuration fields
 */
function createLabelConfig(widgetId, config) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Label';
  group.appendChild(titleEl);

  // Label text field
  const labelField = document.createElement('div');
  labelField.className = 'config-field';

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'config-input';
  labelInput.placeholder = 'Default label';
  labelInput.value = config.label ?? '';
  labelInput.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value === '') {
      delete config.label;
    } else {
      config.label = value;
    }
    state.isDirty = true;
    updatePreview();
  });
  labelField.appendChild(labelInput);

  const hint = document.createElement('div');
  hint.className = 'config-hint';
  hint.textContent = 'Empty = default label, space = no label';
  labelField.appendChild(hint);

  group.appendChild(labelField);

  return group;
}

/**
 * Create common color configuration (label color, content color)
 */
function createCommonColorConfig(widgetId, config) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Colors';
  group.appendChild(titleEl);

  // Label color
  group.appendChild(
    createColorField('Label Color', config.labelColor, (value) => {
      if (value) {
        config.labelColor = value;
      } else {
        delete config.labelColor;
      }
      state.isDirty = true;
      updatePreview();
    })
  );

  // Content color (for simple widgets without state-based colors)
  const schema = WIDGET_CONFIG_SCHEMAS[widgetId];
  if (!schema?.colorOptions) {
    group.appendChild(
      createColorField('Content Color', config.contentColor, (value) => {
        if (value) {
          config.contentColor = value;
        } else {
          delete config.contentColor;
        }
        state.isDirty = true;
        updatePreview();
      })
    );
  }

  return group;
}

/**
 * Create state-based color configuration (e.g., vim modes, git states)
 */
function createStateColorConfig(widgetId, config, colorOptions) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'State Colors';
  group.appendChild(titleEl);

  // Ensure options.colors exists
  if (!config.options) config.options = {};
  if (!config.options.colors) config.options.colors = {};

  const grid = document.createElement('div');
  grid.className = 'color-options-grid';

  for (const opt of colorOptions) {
    const currentValue = config.options.colors[opt.key] ?? '';
    grid.appendChild(
      createColorField(opt.label, currentValue, (value) => {
        if (value) {
          config.options.colors[opt.key] = value;
        } else {
          delete config.options.colors[opt.key];
        }
        // Clean up empty objects
        if (Object.keys(config.options.colors).length === 0) {
          delete config.options.colors;
        }
        if (Object.keys(config.options).length === 0) {
          delete config.options;
        }
        state.isDirty = true;
        updatePreview();
      })
    );
  }

  group.appendChild(grid);
  return group;
}

/**
 * Create bar color configuration for usage widgets
 */
function createBarColorConfig(widgetId, config) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Usage Bar Colors';
  group.appendChild(titleEl);

  // Ensure options.barColors exists
  if (!config.options) config.options = {};
  if (!config.options.barColors) config.options.barColors = {};

  const barColors = [
    { key: 'low', label: 'Low (0-49%)', default: 'green' },
    { key: 'medium', label: 'Medium (50-79%)', default: 'yellow' },
    { key: 'high', label: 'High (80-100%)', default: 'red' },
  ];

  const grid = document.createElement('div');
  grid.className = 'color-options-grid';

  for (const bc of barColors) {
    const currentValue = config.options.barColors[bc.key] ?? '';
    grid.appendChild(
      createColorField(bc.label, currentValue, (value) => {
        if (value) {
          config.options.barColors[bc.key] = value;
        } else {
          delete config.options.barColors[bc.key];
        }
        // Clean up empty objects
        if (Object.keys(config.options.barColors).length === 0) {
          delete config.options.barColors;
        }
        if (Object.keys(config.options).length === 0) {
          delete config.options;
        }
        state.isDirty = true;
        updatePreview();
      })
    );
  }

  group.appendChild(grid);
  return group;
}

/**
 * Create widget-specific options
 */
function createWidgetOptions(widgetId, config, options) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Options';
  group.appendChild(titleEl);

  if (!config.options) config.options = {};

  for (const opt of options) {
    if (opt.type === 'select') {
      group.appendChild(createSelectField(opt, config.options));
    } else if (opt.type === 'checkbox') {
      group.appendChild(createCheckboxField(opt, config.options));
    } else if (opt.type === 'color') {
      group.appendChild(
        createColorField(opt.label, config.options[opt.key] ?? '', (value) => {
          if (value) {
            config.options[opt.key] = value;
          } else {
            delete config.options[opt.key];
          }
          if (Object.keys(config.options).length === 0) {
            delete config.options;
          }
          state.isDirty = true;
          updatePreview();
        })
      );
    }
  }

  return group;
}

/**
 * Create a color select field
 */
function createColorField(label, currentValue, onChange) {
  const field = document.createElement('div');
  field.className = 'config-field';

  const labelEl = document.createElement('label');
  labelEl.className = 'config-label';
  labelEl.textContent = label;
  field.appendChild(labelEl);

  const select = document.createElement('select');
  select.className = 'config-select';

  for (const color of ANSI_COLORS) {
    const option = document.createElement('option');
    option.value = color.value;
    option.textContent = color.label;
    if (currentValue === color.value) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.addEventListener('change', (e) => {
    onChange(e.target.value);
  });

  field.appendChild(select);
  return field;
}

/**
 * Create a select field for options
 */
function createSelectField(opt, optionsObj) {
  const field = document.createElement('div');
  field.className = 'config-field';

  const labelEl = document.createElement('label');
  labelEl.className = 'config-label';
  labelEl.textContent = opt.label;
  field.appendChild(labelEl);

  const select = document.createElement('select');
  select.className = 'config-select';

  const currentValue = optionsObj[opt.key] ?? opt.default;

  for (const option of opt.options) {
    const optionEl = document.createElement('option');
    optionEl.value = option.value;
    optionEl.textContent = option.label;
    if (currentValue === option.value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  }

  select.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === opt.default) {
      delete optionsObj[opt.key];
    } else {
      optionsObj[opt.key] = value;
    }
    state.isDirty = true;
    updatePreview();
  });

  field.appendChild(select);
  return field;
}

/**
 * Create a checkbox field for options
 */
function createCheckboxField(opt, optionsObj) {
  const field = document.createElement('div');
  field.className = 'config-field';

  const label = document.createElement('label');
  label.className = 'config-checkbox-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = optionsObj[opt.key] ?? opt.default;

  checkbox.addEventListener('change', (e) => {
    const value = e.target.checked;
    if (value === opt.default) {
      delete optionsObj[opt.key];
    } else {
      optionsObj[opt.key] = value;
    }
    state.isDirty = true;
    updatePreview();
  });

  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(opt.label));
  field.appendChild(label);
  return field;
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
  // Config panel close button
  const configCloseBtn = document.getElementById('config-close-btn');
  if (configCloseBtn) {
    configCloseBtn.addEventListener('click', hideConfigPanel);
  }

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
