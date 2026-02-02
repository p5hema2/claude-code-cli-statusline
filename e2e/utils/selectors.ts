/**
 * Centralized selectors for all GUI elements
 * Updated to match actual implementation (Phase 7 refactoring)
 *
 * Last verified: 2026-02-02
 */

export const SELECTORS = {
  // App structure
  app: {
    container: '#app',
    header: '.header',
    loading: '.loading',
  },

  // Preview section
  preview: {
    container: '#terminal-preview',
    previewRow: (index: number) => `#preview-row-${index}`,
    allRows: '.preview-row',
    leftSection: '#terminal-left',
    statusbar: '#terminal-left', // Alias for main status content
    rightSection: '#terminal-right',
    footer: '#terminal-footer',
  },

  // Widget palette
  palette: {
    container: '#widget-palette',
    category: '.palette-category',
    widget: (widgetId: string) => `.widget-item[data-widget-id="${widgetId}"]`,
    allWidgets: '.widget-item',
  },

  // Row editor
  rows: {
    container: '#row-editor',
    list: '#row-editor', // Alias for container (backward compatibility)
    row: (index: number) => `.row-container[data-row-index="${index}"]`,
    allRows: '.row-container',
    addButton: '#add-row-btn',
    rowLabel: (index: number) => `.row-container[data-row-index="${index}"] .row-label`,
    closeButton: (index: number) => `.row-container[data-row-index="${index}"] .row-close`,
    widgetsContainer: (index: number) => `.row-widgets[data-row-index="${index}"]`,
    // Widgets in a row
    widget: (rowIndex: number, widgetIndex: number) =>
      `.row-widget[data-row-index="${rowIndex}"][data-widget-index="${widgetIndex}"]`,
    widgetBySlot: (rowIndex: number, slotIndex: number) =>
      `.row-container[data-row-index="${rowIndex}"] .row-widget:nth-child(${slotIndex + 1})`,
    allWidgetsInRow: (rowIndex: number) =>
      `.row-container[data-row-index="${rowIndex}"] .row-widget`,
    widgetRemoveButton: (rowIndex: number, widgetIndex: number) =>
      `.row-widget[data-row-index="${rowIndex}"][data-widget-index="${widgetIndex}"] .row-widget-remove`,
    emptyHint: '.row-empty-hint',
    // NOTE: Per-row alignment/separator controls don't exist in current implementation
    // These are likely global settings or not yet implemented
  },

  // Config panel
  config: {
    panel: '#widget-config-panel',
    header: '.section-header',
    closeButton: '#config-close-btn',
    widgetName: '#config-widget-title',
    content: '#config-content',
    // Dynamic option selectors - structure varies by widget
    colorInput: 'input[type="color"]',
    textInput: 'input[type="text"]',
    checkbox: 'input[type="checkbox"]',
    select: 'select',
    previewStateSelect: '.preview-state-select',
    optionGroup: '.config-option-group',
    // NOTE: No data-option attributes - options are rendered dynamically
  },

  // Preview controls
  controls: {
    terminalSelect: '#terminal-select',
    themeSelect: '#theme-select',
    widthInput: '#width-input',
    // Context simulation (radio buttons, not select)
    contextTypeRadio: (value: string) => `input[name="context-type"][value="${value}"]`,
    contextTypeChecked: 'input[name="context-type"]:checked',
    contextFile: '#file-context-name',
    contextLines: '#line-selection-count',
    contextAutocompact: '#autocompact-percent',
    planMode: '#show-plan-mode',
  },

  // Footer actions
  footer: {
    saveButton: '#save-btn',
    resetButton: '#reset-btn',
    statusMessage: '#status-message',
    statusMessageSuccess: '#status-message.success',
    statusMessageError: '#status-message.error',
    errorMessage: '#status-message.error', // Alias for error status messages
    successMessage: '#status-message.success', // Alias for success status messages
    // NOTE: Dirty indicator selector needs verification - may be in button or separate element
  },

  // Drag & drop
  dragDrop: {
    dragging: '.dragging',
    rowWidget: '.row-widget[draggable="true"]',
    paletteWidget: '.palette-widget[draggable="true"]',
    rowContainer: '.row-container',
    // NOTE: Trash zone may not exist - widgets have individual remove buttons
  },

  // Editor area
  editor: {
    area: '.editor-area',
    paletteSection: '.palette-section',
    rowsSection: '.rows-section',
    hasConfig: '.editor-area.has-config',
  },
} as const;
