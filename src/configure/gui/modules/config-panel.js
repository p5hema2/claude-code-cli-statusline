/**
 * Config Panel Module
 *
 * Manages widget instance configuration panel and UI components.
 */

import { state, ANSI_COLORS, getColorHex, getWidgetSchema } from './state.js';
import { updatePreview } from './preview.js';

export function selectWidgetInstance(rowIndex, widgetIndex) {
  // Deselect previous
  document.querySelectorAll('.row-widget.selected').forEach((el) => el.classList.remove('selected'));

  // Toggle if same
  if (state.selectedInstance?.rowIndex === rowIndex &&
      state.selectedInstance?.widgetIndex === widgetIndex) {
    state.selectedInstance = null;
    hideConfigPanel();
    return;
  }

  state.selectedInstance = { rowIndex, widgetIndex };

  // Highlight selected
  const el = document.querySelector(
    `.row-widget[data-row-index="${rowIndex}"][data-widget-index="${widgetIndex}"]`
  );
  if (el) el.classList.add('selected');

  showConfigPanel();
}

export function showConfigPanel() {
  if (!state.selectedInstance) return;

  const { rowIndex, widgetIndex } = state.selectedInstance;
  const config = state.settings.rows[rowIndex][widgetIndex];
  const widget = state.widgets.find((w) => w.id === config.widget);
  const schema = getWidgetSchema(config.widget);

  if (!widget) return;

  const panel = document.getElementById('widget-config-panel');
  const title = document.getElementById('config-widget-title');
  const content = document.getElementById('config-content');
  const editorArea = document.querySelector('.editor-area');
  const rowsSection = document.querySelector('.rows-section');

  title.textContent = `${widget.name} Settings`;
  content.innerHTML = '';

  // Preview state (if available)
  if (widget.previewStates?.length > 0) {
    content.appendChild(createPreviewStateConfig(widget));
  }

  // Color configuration
  if (schema) {
    const stateColors = schema.options?.content?.stateColors;
    const customOptions = schema.options?.custom || [];

    // Check if custom options include a color option (skip simple color if so)
    const hasCustomColorOption = customOptions.some((opt) => opt.type === 'color');

    if (stateColors?.length > 0) {
      content.appendChild(createStateColorConfig(config, stateColors));
    } else if (!hasCustomColorOption) {
      // Simple color (only if no color in custom options)
      const defaultColor = schema.options?.content?.color || 'white';
      content.appendChild(createSimpleColorConfig(config, defaultColor));
    }

    // Bar colors for usage widgets
    if (schema.options?.bar?.enabled) {
      content.appendChild(createBarColorConfig(config, schema));
    }

    // Custom options
    if (customOptions.length > 0) {
      content.appendChild(createCustomOptions(config, customOptions));
    }
  }

  panel.classList.remove('hidden');
  if (editorArea) editorArea.classList.add('has-config');
  if (rowsSection) rowsSection.classList.add('hidden');
}

export function hideConfigPanel() {
  const panel = document.getElementById('widget-config-panel');
  const editorArea = document.querySelector('.editor-area');
  const rowsSection = document.querySelector('.rows-section');

  panel.classList.add('hidden');
  if (editorArea) editorArea.classList.remove('has-config');
  if (rowsSection) rowsSection.classList.remove('hidden');

  // Restore focus to previously selected widget for accessibility
  const selected = document.querySelector('.row-widget.selected');
  document.querySelectorAll('.row-widget.selected').forEach((el) => el.classList.remove('selected'));
  state.selectedInstance = null;

  if (selected) {
    selected.focus();
  }
}

// ============================================================================
// Config Panel Components
// ============================================================================

function createPreviewStateConfig(widget) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Preview State';
  group.appendChild(titleEl);

  const field = document.createElement('div');
  field.className = 'config-field';

  // Generate unique ID for label association (WCAG 2.0 accessibility)
  const fieldId = `preview-state-${Math.random().toString(36).substring(2, 11)}`;

  const labelEl = document.createElement('label');
  labelEl.className = 'config-label';
  labelEl.textContent = 'Select preview state';
  labelEl.setAttribute('for', fieldId);
  field.appendChild(labelEl);

  const options = widget.previewStates.map((ps) => ({ value: ps.id, label: ps.label }));
  const currentValue = state.widgetStates[widget.id] || options[0]?.value;

  const dropdown = createCustomDropdown({
    id: fieldId,
    options,
    currentValue,
    onChange: (value) => {
      state.widgetStates[widget.id] = value;
      updatePreview();
    },
  });

  field.appendChild(dropdown);
  group.appendChild(field);
  return group;
}

function createSimpleColorConfig(config, defaultColor) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Color';
  group.appendChild(titleEl);

  group.appendChild(createColorField('Widget Color', config.color || '', (value) => {
    // Only delete when empty, preserve values that match defaults
    if (value === '') {
      delete config.color;
    } else {
      config.color = value;
    }
    state.isDirty = true;
    updatePreview();
  }, defaultColor));

  return group;
}

function createStateColorConfig(config, stateColors) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'State Colors';
  group.appendChild(titleEl);

  if (!config.colors) config.colors = {};

  const grid = document.createElement('div');
  grid.className = 'color-options-grid';

  for (const opt of stateColors) {
    const currentValue = config.colors[opt.key] || '';
    grid.appendChild(createColorField(opt.label, currentValue, (value) => {
      // Only delete when empty, preserve values that match defaults
      if (value === '') {
        delete config.colors[opt.key];
      } else {
        config.colors[opt.key] = value;
      }
      if (Object.keys(config.colors).length === 0) delete config.colors;
      state.isDirty = true;
      updatePreview();
    }, opt.default));
  }

  group.appendChild(grid);
  return group;
}

function createBarColorConfig(config, schema) {
  const group = document.createElement('div');
  group.className = 'config-group';

  const titleEl = document.createElement('div');
  titleEl.className = 'config-group-title';
  titleEl.textContent = 'Usage Bar Colors';
  group.appendChild(titleEl);

  if (!config.options) config.options = {};
  if (!config.options.barColors) config.options.barColors = {};

  const defaults = schema.options?.bar?.colors || {};
  const barColors = [
    { key: 'low', label: 'Low (0-49%)', default: defaults.low || 'green' },
    { key: 'medium', label: 'Medium (50-79%)', default: defaults.medium || 'yellow' },
    { key: 'high', label: 'High (80-100%)', default: defaults.high || 'red' },
  ];

  const grid = document.createElement('div');
  grid.className = 'color-options-grid';

  for (const bc of barColors) {
    const currentValue = config.options.barColors[bc.key] || '';
    grid.appendChild(createColorField(bc.label, currentValue, (value) => {
      // Only delete when empty, preserve values that match defaults
      if (value === '') {
        delete config.options.barColors[bc.key];
      } else {
        config.options.barColors[bc.key] = value;
      }
      if (Object.keys(config.options.barColors).length === 0) delete config.options.barColors;
      if (Object.keys(config.options).length === 0) delete config.options;
      state.isDirty = true;
      updatePreview();
    }, bc.default));
  }

  group.appendChild(grid);
  return group;
}

/**
 * Detect if options follow the indicator pattern (xxxSymbol, xxxColor, showXxx)
 * Returns grouped indicators if pattern matches, null otherwise
 */
function detectIndicatorGroups(customOptions) {
  const indicatorPattern = /^(dirty|staged|untracked|ahead|behind)(Symbol|Color)$/;
  const showPattern = /^show(Dirty|Staged|Untracked|Ahead|Behind)$/;

  const indicators = {};
  const otherOptions = [];

  for (const opt of customOptions) {
    const match = opt.key.match(indicatorPattern);
    const showMatch = opt.key.match(showPattern);

    if (match) {
      const [, name, type] = match;
      if (!indicators[name]) indicators[name] = {};
      indicators[name][type.toLowerCase()] = opt;
    } else if (showMatch) {
      const name = showMatch[1].toLowerCase();
      if (!indicators[name]) indicators[name] = {};
      indicators[name].show = opt;
    } else {
      otherOptions.push(opt);
    }
  }

  // Check if we have complete indicator groups
  const names = Object.keys(indicators);
  if (names.length === 0) return null;

  const completeGroups = names.filter(
    (name) => indicators[name].symbol && indicators[name].color && indicators[name].show
  );

  if (completeGroups.length === 0) return null;

  return { indicators, otherOptions, completeGroups };
}

function createCustomOptions(config, customOptions) {
  const container = document.createElement('div');
  container.className = 'config-group';

  if (!config.options) config.options = {};

  // Check for indicator pattern (gitBranch widget)
  const indicatorData = detectIndicatorGroups(customOptions);

  if (indicatorData) {
    // Render non-indicator options first (like branchColor)
    if (indicatorData.otherOptions.length > 0) {
      const otherGroup = document.createElement('div');
      otherGroup.className = 'config-group';

      const titleEl = document.createElement('div');
      titleEl.className = 'config-group-title';
      titleEl.textContent = 'Branch';
      otherGroup.appendChild(titleEl);

      for (const opt of indicatorData.otherOptions) {
        if (opt.type === 'select') {
          otherGroup.appendChild(createSelectField(opt, config.options));
        } else if (opt.type === 'checkbox') {
          otherGroup.appendChild(createCheckboxField(opt, config.options));
        } else if (opt.type === 'color') {
          otherGroup.appendChild(createColorField(opt.label, config.options[opt.key] || '', (value) => {
            // Only delete when empty, preserve values that match defaults
            if (value === '') {
              delete config.options[opt.key];
            } else {
              config.options[opt.key] = value;
            }
            if (Object.keys(config.options).length === 0) delete config.options;
            state.isDirty = true;
            updatePreview();
          }, opt.default));
        } else if (opt.type === 'text') {
          otherGroup.appendChild(createTextField(opt, config.options));
        }
      }

      container.appendChild(otherGroup);

      // Add separator
      const separator = document.createElement('div');
      separator.className = 'config-separator';
      container.appendChild(separator);
    }

    // Render indicator grid
    const indicatorGroup = document.createElement('div');
    indicatorGroup.className = 'config-group';

    const titleEl = document.createElement('div');
    titleEl.className = 'config-group-title';
    titleEl.textContent = 'Indicators';
    indicatorGroup.appendChild(titleEl);

    const grid = document.createElement('div');
    grid.className = 'indicator-grid';

    // Header row
    const header = document.createElement('div');
    header.className = 'indicator-grid-header';
    header.innerHTML = '<span>Status</span><span>Symbol</span><span>Color</span><span>Show</span>';
    grid.appendChild(header);

    // Indicator rows
    const indicatorLabels = {
      dirty: 'Dirty',
      staged: 'Staged',
      untracked: 'Untracked',
      ahead: 'Ahead',
      behind: 'Behind',
    };

    for (const name of indicatorData.completeGroups) {
      const ind = indicatorData.indicators[name];
      const row = document.createElement('div');
      row.className = 'indicator-grid-row';

      // Label
      const labelEl = document.createElement('span');
      labelEl.className = 'indicator-label';
      labelEl.textContent = indicatorLabels[name] || name;
      row.appendChild(labelEl);

      // Symbol dropdown
      const symbolDropdown = createIndicatorSelect(ind.symbol, config.options);
      row.appendChild(symbolDropdown);

      // Color dropdown
      const colorDropdown = createIndicatorColorField(ind.color, config.options);
      row.appendChild(colorDropdown);

      // Show checkbox
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'indicator-checkbox';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = config.options[ind.show.key] ?? ind.show.default;
      checkbox.title = ind.show.label;
      checkbox.setAttribute('aria-label', ind.show.label); // WCAG 2.0 accessibility
      checkbox.addEventListener('change', (e) => {
        const value = e.target.checked;
        if (value === ind.show.default) {
          delete config.options[ind.show.key];
        } else {
          config.options[ind.show.key] = value;
        }
        if (Object.keys(config.options).length === 0) delete config.options;
        state.isDirty = true;
        updatePreview();
      });
      checkboxContainer.appendChild(checkbox);
      row.appendChild(checkboxContainer);

      grid.appendChild(row);
    }

    indicatorGroup.appendChild(grid);
    container.appendChild(indicatorGroup);

  } else {
    // Standard rendering for other widgets
    const titleEl = document.createElement('div');
    titleEl.className = 'config-group-title';
    titleEl.textContent = 'Options';
    container.appendChild(titleEl);

    for (const opt of customOptions) {
      if (opt.type === 'select') {
        container.appendChild(createSelectField(opt, config.options));
      } else if (opt.type === 'checkbox') {
        container.appendChild(createCheckboxField(opt, config.options));
      } else if (opt.type === 'color') {
        container.appendChild(createColorField(opt.label, config.options[opt.key] || '', (value) => {
          // Only delete when empty, preserve values that match defaults
          if (value === '') {
            delete config.options[opt.key];
          } else {
            config.options[opt.key] = value;
          }
          if (Object.keys(config.options).length === 0) delete config.options;
          state.isDirty = true;
          updatePreview();
        }, opt.default));
      } else if (opt.type === 'text') {
        container.appendChild(createTextField(opt, config.options));
      }
    }
  }

  return container;
}

/**
 * Create a compact select dropdown for indicator grid
 */
function createIndicatorSelect(opt, optionsObj) {
  const currentValue = optionsObj[opt.key] ?? opt.default;

  return createCustomDropdown({
    options: opt.options,
    currentValue,
    onChange: (value) => {
      if (value === opt.default) {
        delete optionsObj[opt.key];
      } else {
        optionsObj[opt.key] = value;
      }
      state.isDirty = true;
      updatePreview();
    },
  });
}

/**
 * Create a compact color dropdown for indicator grid
 */
function createIndicatorColorField(opt, optionsObj) {
  const currentValue = optionsObj[opt.key] || opt.default;

  return createCustomDropdown({
    options: ANSI_COLORS,
    currentValue,
    onChange: (value) => {
      if (value === opt.default) {
        delete optionsObj[opt.key];
      } else {
        optionsObj[opt.key] = value;
      }
      state.isDirty = true;
      updatePreview();
    },
    renderOption: (el, option) => {
      const hex = getColorHex(option.value);
      if (hex) el.style.color = hex;
      else if (option.value === 'dim') el.style.opacity = '0.5';
      else if (option.value === 'bold') el.style.fontWeight = 'bold';
      el.textContent = option.label;
    },
    renderTrigger: (option, value) => {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-dropdown-label';
      labelSpan.textContent = option?.label || opt.default;
      const hex = getColorHex(value);
      if (hex) labelSpan.style.color = hex;
      else if (value === 'dim') labelSpan.style.opacity = '0.5';
      else if (value === 'bold') labelSpan.style.fontWeight = 'bold';
      return labelSpan;
    },
  });
}

// ============================================================================
// UI Components
// ============================================================================

function createCustomDropdown({ id, options, currentValue, onChange, renderOption, renderTrigger }) {
  const dropdown = document.createElement('div');
  dropdown.className = 'custom-dropdown';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-dropdown-trigger';

  // Add ID for label association if provided (WCAG 2.0 accessibility)
  if (id) {
    trigger.id = id;
  }

  const optionsPanel = document.createElement('div');
  optionsPanel.className = 'custom-dropdown-options';

  let selectedValue = currentValue ?? '';

  function getSelectedOption() {
    return options.find((o) => o.value === selectedValue) || options[0];
  }

  function updateTrigger() {
    trigger.innerHTML = '';
    const selected = getSelectedOption();

    if (renderTrigger) {
      trigger.appendChild(renderTrigger(selected, selectedValue));
    } else {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-dropdown-label';
      labelSpan.textContent = selected?.label || '';
      trigger.appendChild(labelSpan);
    }

    const arrow = document.createElement('span');
    arrow.className = 'custom-dropdown-arrow';
    arrow.textContent = '▼';
    trigger.appendChild(arrow);
  }

  function buildOptions() {
    optionsPanel.innerHTML = '';
    for (const opt of options) {
      const optionEl = document.createElement('div');
      optionEl.className = 'custom-dropdown-option';
      if (opt.value === selectedValue) optionEl.classList.add('selected');
      optionEl.dataset.value = opt.value;

      if (renderOption) {
        renderOption(optionEl, opt);
      } else {
        optionEl.textContent = opt.label;
      }

      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedValue = opt.value;
        updateTrigger();
        buildOptions();
        dropdown.classList.remove('open');
        onChange(selectedValue);
      });

      optionsPanel.appendChild(optionEl);
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.custom-dropdown.open').forEach((d) => d.classList.remove('open'));
    if (!isOpen) dropdown.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
  });

  updateTrigger();
  buildOptions();

  dropdown.appendChild(trigger);
  dropdown.appendChild(optionsPanel);
  return dropdown;
}

function createColorField(label, currentValue, onChange, defaultValue = 'dim') {
  const field = document.createElement('div');
  field.className = 'config-field';

  // Generate unique ID for label association (WCAG 2.0 accessibility)
  const fieldId = `color-field-${Math.random().toString(36).substring(2, 11)}`;

  const labelEl = document.createElement('label');
  labelEl.className = 'config-label';
  labelEl.textContent = label;
  labelEl.setAttribute('for', fieldId);
  field.appendChild(labelEl);

  const effectiveValue = currentValue || defaultValue;

  const dropdown = createCustomDropdown({
    id: fieldId,
    options: ANSI_COLORS,
    currentValue: effectiveValue,
    onChange: (value) => {
      // Pass actual value to onChange, let callback decide what to save
      onChange(value);
    },
    renderOption: (el, opt) => {
      const hex = getColorHex(opt.value);
      if (hex) el.style.color = hex;
      else if (opt.value === 'dim') el.style.opacity = '0.5';
      else if (opt.value === 'bold') el.style.fontWeight = 'bold';
      el.textContent = opt.label;
    },
    renderTrigger: (opt, value) => {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'custom-dropdown-label';
      labelSpan.textContent = opt?.label || defaultValue;
      const hex = getColorHex(value);
      if (hex) labelSpan.style.color = hex;
      else if (value === 'dim') labelSpan.style.opacity = '0.5';
      else if (value === 'bold') labelSpan.style.fontWeight = 'bold';
      return labelSpan;
    },
  });

  field.appendChild(dropdown);
  return field;
}

function createSelectField(opt, optionsObj) {
  const field = document.createElement('div');
  field.className = 'config-field';

  // Generate unique ID for label association (WCAG 2.0 accessibility)
  const fieldId = `select-field-${Math.random().toString(36).substring(2, 11)}`;

  const labelEl = document.createElement('label');
  labelEl.className = 'config-label';
  labelEl.textContent = opt.label;
  labelEl.setAttribute('for', fieldId);
  field.appendChild(labelEl);

  const currentValue = optionsObj[opt.key] ?? opt.default;

  const dropdown = createCustomDropdown({
    id: fieldId,
    options: opt.options,
    currentValue,
    onChange: (value) => {
      if (value === opt.default) {
        delete optionsObj[opt.key];
      } else {
        optionsObj[opt.key] = value;
      }
      state.isDirty = true;
      updatePreview();
    },
  });

  field.appendChild(dropdown);
  return field;
}

function createCheckboxField(opt, optionsObj) {
  const field = document.createElement('div');
  field.className = 'config-field';

  // Generate unique ID for label association (WCAG 2.0 accessibility)
  const fieldId = `checkbox-field-${Math.random().toString(36).substring(2, 11)}`;

  const label = document.createElement('label');
  label.className = 'config-checkbox-label';
  label.setAttribute('for', fieldId);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = fieldId;
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

/**
 * Create a text input field
 */
function createTextField(opt, optionsObj) {
  const field = document.createElement('div');
  field.className = 'config-field';

  // Generate unique ID for label association (WCAG 2.0 accessibility)
  const fieldId = `text-field-${Math.random().toString(36).substring(2, 11)}`;

  // Label
  const label = document.createElement('label');
  label.className = 'config-label';
  label.setAttribute('for', fieldId);
  label.textContent = opt.label;

  // Text input
  const input = document.createElement('input');
  input.type = 'text';
  input.id = fieldId;
  input.className = 'config-input';
  input.value = optionsObj[opt.key] ?? opt.default;
  input.placeholder = opt.placeholder || '';
  if (opt.maxLength) {
    input.maxLength = opt.maxLength;
  }

  // Character counter (if maxLength specified)
  let counterEl;
  if (opt.maxLength) {
    counterEl = document.createElement('span');
    counterEl.className = 'text-xs text-text-muted';
    counterEl.textContent = `${input.value.length}/${opt.maxLength}`;
  }

  input.addEventListener('input', (e) => {
    const value = e.target.value;

    // Update character counter
    if (counterEl) {
      counterEl.textContent = `${value.length}/${opt.maxLength}`;
    }

    // Update options
    // Only delete when empty, preserve values that match defaults
    if (value === '') {
      delete optionsObj[opt.key];
    } else {
      optionsObj[opt.key] = value;
    }
    state.isDirty = true;
    updatePreview();
  });

  field.appendChild(label);

  // Wrapper for input and counter
  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'flex items-center gap-2';
  inputWrapper.appendChild(input);
  if (counterEl) {
    inputWrapper.appendChild(counterEl);
  }

  field.appendChild(inputWrapper);
  return field;
}
