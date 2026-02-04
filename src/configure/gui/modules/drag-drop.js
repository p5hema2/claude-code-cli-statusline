/**
 * Drag and Drop Module
 *
 * Handles all drag and drop operations for widgets and rows.
 */

import { state } from './state.js';
import { renderRowEditor } from './row-editor.js';
import { updatePreview } from './preview.js';

let dragData = null;

export function handleDragStart(e, widgetId, source, rowIndex = null, widgetIndex = null) {
  dragData = { widgetId, source, rowIndex, widgetIndex };
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', widgetId);
}

export function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  dragData = null;
  document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
}

export function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

export function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

export function handleDrop(e, targetRowIndex) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  if (!dragData) return;

  const { widgetId, source, rowIndex, widgetIndex } = dragData;

  if (source === 'palette') {
    addWidgetToRow(widgetId, targetRowIndex);
  } else if (source === 'row') {
    moveWidget(rowIndex, widgetIndex, targetRowIndex);
  }

  dragData = null;
}

/**
 * Handle drag over a widget (for reordering within row)
 */
export function handleWidgetDragOver(e, widgetEl) {
  e.preventDefault();
  e.stopPropagation();

  if (!dragData) return;

  // Clear previous indicators
  document.querySelectorAll('.drag-over-left, .drag-over-right').forEach((el) => {
    el.classList.remove('drag-over-left', 'drag-over-right');
  });

  // Determine if dropping left or right based on mouse position
  const rect = widgetEl.getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;
  const isLeft = e.clientX < midpoint;

  widgetEl.classList.add(isLeft ? 'drag-over-left' : 'drag-over-right');
  e.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drag leave from a widget
 */
export function handleWidgetDragLeave(e, widgetEl) {
  // Only remove if actually leaving the element (not entering a child)
  if (!widgetEl.contains(e.relatedTarget)) {
    widgetEl.classList.remove('drag-over-left', 'drag-over-right');
  }
}

/**
 * Handle drop on a widget (for reordering within row)
 */
export function handleWidgetDrop(e, targetRowIndex, targetWidgetIndex) {
  e.preventDefault();
  e.stopPropagation();

  const widgetEl = e.currentTarget;
  const isLeft = widgetEl.classList.contains('drag-over-left');

  // Clear indicators
  document.querySelectorAll('.drag-over-left, .drag-over-right, .drag-over').forEach((el) => {
    el.classList.remove('drag-over-left', 'drag-over-right', 'drag-over');
  });

  if (!dragData) return;

  const { widgetId, source, rowIndex, widgetIndex } = dragData;

  if (source === 'palette') {
    // Insert widget from palette at specific position
    insertWidgetAtPosition(widgetId, targetRowIndex, targetWidgetIndex, isLeft);
  } else if (source === 'row') {
    // Reorder within or between rows
    reorderWidget(rowIndex, widgetIndex, targetRowIndex, targetWidgetIndex, isLeft);
  }

  dragData = null;
}

/**
 * Insert a new widget at a specific position in a row
 */
function insertWidgetAtPosition(widgetId, rowIndex, targetIndex, insertBefore) {
  if (!state.settings.rows?.[rowIndex]) return;

  const row = state.settings.rows[rowIndex];
  const insertIndex = insertBefore ? targetIndex : targetIndex + 1;

  // Create new widget config
  const config = { widget: widgetId };

  // Insert at position
  row.splice(insertIndex, 0, config);

  // Add separators if needed
  ensureSeparators(row);

  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

/**
 * Reorder a widget within or between rows
 */
function reorderWidget(fromRowIndex, fromWidgetIndex, toRowIndex, toWidgetIndex, insertBefore) {
  if (!state.settings.rows) return;

  const fromRow = state.settings.rows[fromRowIndex];
  const toRow = state.settings.rows[toRowIndex];

  if (!fromRow || !toRow) return;

  // Don't do anything if dropping on itself
  if (fromRowIndex === toRowIndex && fromWidgetIndex === toWidgetIndex) return;

  // Get the widget config
  const [config] = fromRow.splice(fromWidgetIndex, 1);

  // Calculate insertion index
  let insertIndex = insertBefore ? toWidgetIndex : toWidgetIndex + 1;

  // Adjust index if moving within same row and removing from earlier position
  if (fromRowIndex === toRowIndex && fromWidgetIndex < toWidgetIndex) {
    insertIndex--;
  }

  // Insert at new position
  toRow.splice(insertIndex, 0, config);

  // Clean up separators in both rows
  ensureSeparators(fromRow);
  if (fromRowIndex !== toRowIndex) {
    ensureSeparators(toRow);
  }

  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

/**
 * Ensure proper separator placement in a row
 * - Remove leading/trailing separators
 * - Remove consecutive separators
 * - Add separators between non-separator widgets if missing
 */
function ensureSeparators(row) {
  // First clean up
  cleanupSeparators(row);

  // Then add missing separators between widgets
  for (let i = row.length - 1; i > 0; i--) {
    const current = row[i];
    const previous = row[i - 1];
    if (current.widget !== 'separator' && previous.widget !== 'separator') {
      row.splice(i, 0, { widget: 'separator' });
    }
  }
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

export function addWidgetToRow(widgetId, rowIndex) {
  if (!state.settings.rows?.[rowIndex]) return;

  // Create new widget config
  const config = { widget: widgetId };

  // Add separator before if row not empty and last item is not a separator
  const row = state.settings.rows[rowIndex];
  if (row.length > 0 && row[row.length - 1].widget !== 'separator' && widgetId !== 'separator') {
    row.push({ widget: 'separator' });
  }

  row.push(config);
  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}

function moveWidget(fromRowIndex, fromWidgetIndex, toRowIndex) {
  if (!state.settings.rows) return;

  const fromRow = state.settings.rows[fromRowIndex];
  const toRow = state.settings.rows[toRowIndex];

  if (!fromRow || !toRow) return;

  // Get the widget config
  const [config] = fromRow.splice(fromWidgetIndex, 1);

  // Clean up source row separators
  cleanupSeparators(fromRow);

  // Add to target row
  if (toRow.length > 0 && toRow[toRow.length - 1].widget !== 'separator' && config.widget !== 'separator') {
    toRow.push({ widget: 'separator' });
  }
  toRow.push(config);

  state.isDirty = true;
  renderRowEditor();
  updatePreview();
}
