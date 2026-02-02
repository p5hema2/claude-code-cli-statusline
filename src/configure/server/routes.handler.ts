/**
 * REST API route handlers for the configuration server
 *
 * Provides endpoints for loading/saving settings, widget metadata,
 * and generating preview HTML.
 *
 * Widget metadata and categories are derived from widget schemas,
 * eliminating the need for separate hardcoded data.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

import type {
  APIResponse,
  PreviewRequest,
  PreviewResponse,
  Settings,
  WidgetsResponse,
  WidgetMetadata,
  WidgetCategory,
  WidgetSchema,
} from '../../types/index.js';
import { loadSettings, saveSettings , renderStatusLineRows } from '../../utils/index.js';
import { getAllSchemas } from '../../widgets/index.js';
import { ansiToHtml, TERMINAL_PALETTES } from '../preview/ansi-to-html.util.js';
import {
  generateMockStatus,
  generateMockUsage,
  getMockGitInfo,
  DEFAULT_WIDGET_STATES,
} from '../preview/mock-data.fixture.js';
import { TERMINAL_THEMES } from '../preview/terminal-themes.const.js';

/**
 * Derive widget metadata from schemas
 *
 * Transforms WidgetSchema into WidgetMetadata format for API compatibility.
 * Uses the new nested schema structure (schema.meta.displayName, etc.)
 */
function deriveWidgetMetadata(schemas: WidgetSchema[]): WidgetMetadata[] {
  return schemas.map((schema) => ({
    id: schema.id,
    name: schema.meta.displayName,
    description: schema.meta.description,
    category: schema.meta.category,
    previewStates: schema.previewStates,
  }));
}

/**
 * Derive categories from schemas
 *
 * Groups widgets by their category field and creates category objects
 * with display names from CATEGORY_NAMES.
 * Uses the new nested schema structure (schema.meta.category).
 */
function deriveCategories(schemas: WidgetSchema[]): WidgetCategory[] {
  // Group schemas by category
  const grouped = new Map<string, string[]>();

  for (const schema of schemas) {
    const list = grouped.get(schema.meta.category) || [];
    list.push(schema.id);
    grouped.set(schema.meta.category, list);
  }

  // Convert to category array with display names
  // Maintain consistent category order
  const categoryOrder = ['location', 'model', 'usage', 'editor'];

  return categoryOrder
    .filter((id) => grouped.has(id))
    .map((id) => ({
      id,
      name: id,
      widgets: grouped.get(id)!,
    }));
}

/**
 * Read request body as JSON
 */
async function readBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(JSON.parse(body) as T);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson<T>(res: ServerResponse, data: APIResponse<T>, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Send error response
 */
function sendError(res: ServerResponse, message: string, status = 400): void {
  sendJson(res, { success: false, error: message }, status);
}

/**
 * GET /api/settings - Load current settings
 */
export async function handleGetSettings(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const settings = loadSettings();
    sendJson(res, { success: true, data: settings });
  } catch {
    sendError(res, 'Failed to load settings', 500);
  }
}

/**
 * PUT /api/settings - Save settings
 */
export async function handlePutSettings(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const settings = await readBody<Settings>(req);
    saveSettings(settings);
    sendJson(res, { success: true, data: settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    sendError(res, message, 500);
  }
}

/**
 * GET /api/widgets - Get widget metadata and categories
 *
 * Widget data is derived from schemas exported by each widget.
 * This ensures the GUI always reflects the current widget implementations.
 */
export async function handleGetWidgets(
  _req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const schemas = getAllSchemas();

  const data: WidgetsResponse = {
    widgets: deriveWidgetMetadata(schemas),
    categories: deriveCategories(schemas),
    themes: TERMINAL_THEMES,
    terminalPalettes: TERMINAL_PALETTES.map((p) => ({ id: p.id, name: p.name, colors: p.colors })),
    widgetSchemas: schemas,
  };
  sendJson(res, { success: true, data });
}

/**
 * POST /api/preview - Generate preview HTML
 */
export async function handlePostPreview(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const body = await readBody<PreviewRequest>(req);
    const { settings, terminalWidth, widgetStates, terminalPalette } = body;

    // Merge default states with provided overrides
    const states = { ...DEFAULT_WIDGET_STATES, ...widgetStates };

    // Generate mock data based on states
    const status = generateMockStatus(states);
    const usage = generateMockUsage(states);
    const mockGitInfo = getMockGitInfo(states);

    // Render the status line rows
    const ansiRows = renderStatusLineRows({
      status,
      usage,
      terminalWidth: terminalWidth || 80,
      settings,
      mockGitInfo,
    });

    // Convert ANSI to HTML for each row using the selected terminal palette
    const htmlRows = ansiRows.map((row) => ansiToHtml(row, terminalPalette));

    const response: PreviewResponse = {
      rows: htmlRows,
      ansi: ansiRows,
      statusInfo: {
        model: status.model?.display_name || status.model?.id,
        contextWindow:
          status.context_window && status.context_window.remaining_percentage !== undefined
            ? {
                current: Math.floor(status.context_window.remaining_percentage * 2000),
                total: 200000,
                percentage: status.context_window.remaining_percentage,
              }
            : undefined,
        outputStyle: status.output_style?.name,
        vimMode: status.vim_mode?.mode,
        directory: status.current_dir,
        gitBranch: mockGitInfo?.branch,
      },
    };

    sendJson(res, { success: true, data: response });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate preview';
    sendError(res, message, 500);
  }
}

/**
 * Route API requests
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  // Route to handler
  if (url === '/api/settings' && method === 'GET') {
    await handleGetSettings(req, res);
    return true;
  }

  if (url === '/api/settings' && method === 'PUT') {
    await handlePutSettings(req, res);
    return true;
  }

  if (url === '/api/widgets' && method === 'GET') {
    await handleGetWidgets(req, res);
    return true;
  }

  if (url === '/api/preview' && method === 'POST') {
    await handlePostPreview(req, res);
    return true;
  }

  return false;
}
