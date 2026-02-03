/**
 * Widget Palette Module
 *
 * Renders the draggable widget palette on the left side.
 */

import { state, isCategoryExpanded, getWidgetSchema } from './state.js';
import { handleDragStart, handleDragEnd } from './drag-drop.js';

export function renderWidgetPalette() {
  const container = document.getElementById('widget-palette');
  container.innerHTML = '';

  for (const category of state.categories) {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'palette-category';
    categoryEl.dataset.categoryId = category.id;

    // Category header with collapse toggle
    const isExpanded = isCategoryExpanded(category.id);
    const toggleIcon = isExpanded ? '▼' : '▶';

    const headerEl = document.createElement('div');
    headerEl.className = 'category-header';
    headerEl.dataset.toggleCategory = category.id;
    headerEl.innerHTML = `
      <span class="category-toggle-icon">${toggleIcon}</span>
      <h3 class="category-name">${category.name}</h3>
    `;

    categoryEl.appendChild(headerEl);

    // Category content (widgets)
    const contentEl = document.createElement('div');
    contentEl.className = isExpanded ? 'category-content' : 'category-content hidden';

    for (const widgetId of category.widgets) {
      const schema = getWidgetSchema(widgetId);
      if (!schema) continue;

      const widgetEl = createWidgetItem(schema);
      contentEl.appendChild(widgetEl);
    }

    categoryEl.appendChild(contentEl);
    container.appendChild(categoryEl);
  }
}

export function createWidgetItem(schema) {
  const el = document.createElement('div');
  el.className = 'widget-item';
  el.draggable = true;
  el.dataset.widgetId = schema.id;

  el.innerHTML = `
    <div class="widget-item-info">
      <div class="widget-item-name">${schema.meta.displayName}</div>
      <div class="widget-item-desc">${schema.meta.description}</div>
    </div>
  `;

  el.addEventListener('dragstart', (e) => handleDragStart(e, schema.id, 'palette'));
  el.addEventListener('dragend', handleDragEnd);

  return el;
}
