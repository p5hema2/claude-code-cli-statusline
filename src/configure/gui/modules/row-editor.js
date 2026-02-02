/**
 * Row Editor Module
 *
 * Renders and manages the row editor interface and row operations.
 */

import { state, TRASH_ICON_SVG } from './state.js';
import {
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleWidgetDragOver,
  handleWidgetDragLeave,
  handleWidgetDrop,
} from './drag-drop.js';
import { selectWidgetInstance, hideConfigPanel } from './config-panel.js';
import { updatePreview } from './preview.js';

export function renderRowEditor() {
  const container = document.getElementById('row-editor');
  container.innerHTML = '';

  const rows = state.settings.rows || [];

  rows.forEach((row, rowIndex) => {
    const rowEl = createRowElement(row, rowIndex);
    container.appendChild(rowEl);
  });

  if (rows.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'row-container';
    emptyEl.innerHTML = '<span class="row-empty-hint">Click "Add Row" to create a row</span>';
    container.appendChild(emptyEl);
  }
}

function createRowElement(row, rowIndex) {
  const el = document.createElement('div');
  el.className = 'row-container';
  el.dataset.rowIndex = rowIndex;

  // Row label (positioned absolutely above left corner)
  const labelEl = document.createElement('div');
  labelEl.className = 'row-label';
  labelEl.textContent = `Row ${rowIndex + 1}`;
  el.appendChild(labelEl);

  // Close button (positioned absolutely in top right corner)
  const closeBtn = document.createElement('button');
  closeBtn.className = 'row-close';
  closeBtn.innerHTML = TRASH_ICON_SVG;
  closeBtn.title = 'Delete row';
  closeBtn.addEventListener('click', () => deleteRow(rowIndex));
  el.appendChild(closeBtn);

  // Widgets container
  const widgetsEl = document.createElement('div');
  widgetsEl.className = 'row-widgets';
  widgetsEl.dataset.rowIndex = rowIndex;

  // Render widgets in this row
  row.forEach((config, widgetIndex) => {
    const widget = state.widgets.find((w) => w.id === config.widget);
    if (!widget) return;

    const widgetEl = createRowWidget(widget, config, rowIndex, widgetIndex);
    widgetsEl.appendChild(widgetEl);
  });

  if (row.length === 0) {
    const hintEl = document.createElement('span');
    hintEl.className = 'row-empty-hint';
    hintEl.textContent = 'Drag widgets here';
    widgetsEl.appendChild(hintEl);
  }

  el.appendChild(widgetsEl);

  // Drop zone events for adding widgets to row
  el.addEventListener('dragover', handleDragOver);
  el.addEventListener('dragleave', handleDragLeave);
  el.addEventListener('drop', (e) => handleDrop(e, rowIndex));

  return el;
}

function createRowWidget(widget, config, rowIndex, widgetIndex) {
  const el = document.createElement('div');
  el.className = 'row-widget';
  if (config.widget === 'separator') {
    el.classList.add('row-widget-separator');
  }
  el.draggable = true;
  el.dataset.widgetId = config.widget;
  el.dataset.rowIndex = rowIndex;
  el.dataset.widgetIndex = widgetIndex;

  // Highlight if selected
  if (state.selectedInstance?.rowIndex === rowIndex &&
      state.selectedInstance?.widgetIndex === widgetIndex) {
    el.classList.add('selected');
  }

  const nameEl = document.createElement('span');
  nameEl.textContent = config.widget === 'separator' ? '|' : widget.name;
  el.appendChild(nameEl);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'row-widget-remove';
  removeBtn.innerHTML = TRASH_ICON_SVG;
  removeBtn.title = 'Remove widget';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeWidgetFromRow(rowIndex, widgetIndex);
  });
  el.appendChild(removeBtn);

  // Click to configure (skip separators by default)
  el.addEventListener('click', (e) => {
    if (e.target.classList.contains('row-widget-remove')) return;
    selectWidgetInstance(rowIndex, widgetIndex);
  });

  // Drag events for the widget itself
  el.addEventListener('dragstart', (e) => handleDragStart(e, config.widget, 'row', rowIndex, widgetIndex));
  el.addEventListener('dragend', handleDragEnd);

  // Drop zone events for reordering within row
  el.addEventListener('dragover', (e) => handleWidgetDragOver(e, el));
  el.addEventListener('dragleave', (e) => handleWidgetDragLeave(e, el));
  el.addEventListener('drop', (e) => handleWidgetDrop(e, rowIndex, widgetIndex));

  return el;
}

// ============================================================================
// Row Operations
// ============================================================================

export function addRow() {
  if (!state.settings.rows) state.settings.rows = [];
  state.settings.rows.push([]);
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

export function deleteRow(rowIndex) {
  if (!state.settings.rows) return;
  state.settings.rows.splice(rowIndex, 1);
  state.isDirty = true;
  // Clear selection if in deleted row
  if (state.selectedInstance?.rowIndex === rowIndex) {
    state.selectedInstance = null;
    hideConfigPanel();
  }
  renderRowEditor();
  updatePreview();
}

function removeWidgetFromRow(rowIndex, widgetIndex) {
  if (!state.settings.rows?.[rowIndex]) return;

  const row = state.settings.rows[rowIndex];
  row.splice(widgetIndex, 1);

  // Clean up orphan separators
  cleanupSeparators(row);

  // Clear selection if removed
  if (state.selectedInstance?.rowIndex === rowIndex &&
      state.selectedInstance?.widgetIndex === widgetIndex) {
    state.selectedInstance = null;
    hideConfigPanel();
  }

  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

function cleanupSeparators(row) {
  // Remove leading separators
  while (row.length > 0 && row[0].widget === 'separator') {
    row.shift();
  }
  // Remove trailing separators
  while (row.length > 0 && row[row.length - 1].widget === 'separator') {
    row.pop();
  }
  // Remove consecutive separators
  for (let i = row.length - 1; i > 0; i--) {
    if (row[i].widget === 'separator' && row[i - 1].widget === 'separator') {
      row.splice(i, 1);
    }
  }
}
