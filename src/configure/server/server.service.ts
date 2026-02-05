/**
 * Configuration server
 *
 * HTTP server that serves the configuration GUI and API endpoints.
 * Uses Node's built-in http module with no external dependencies.
 * Supports live-reload via Server-Sent Events (SSE) for development.
 */

import { exec } from 'node:child_process';
import { createSocket } from 'node:dgram';
import { readFileSync, existsSync, watch } from 'node:fs';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleApiRequest } from './routes.handler.js';

/** Server configuration options */
export interface ConfigServerOptions {
  /** Whether to open browser automatically (default: true) */
  openBrowser?: boolean;
  /** Port to start server on (default: 8765, or PORT env var) */
  port?: number;
}

/** Connected SSE clients for live reload */
const sseClients = new Set<ServerResponse>();

/** MIME types for static files */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/** Get the directory containing the GUI files */
function getGuiDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  // In dev: src/configure/server/server.service.ts -> src/configure/gui
  // In dist: dist/configure/server/server.service.js -> dist/configure/gui
  return join(dirname(currentFile), '..', 'gui');
}

/**
 * Check if a port is available
 * @internal - Exported for testing
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createSocket('udp4');
    socket.once('error', () => {
      socket.close();
      resolve(false);
    });
    socket.once('listening', () => {
      socket.close();
      resolve(true);
    });
    socket.bind(port);
  });
}

/**
 * Find an available port starting from the given port
 * @internal - Exported for testing
 */
export async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available port found');
}

/**
 * Open URL in default browser
 * @internal - Exported for testing
 */
export function openBrowser(url: string): void {
  const platform = process.platform;
  let command: string;

  switch (platform) {
    case 'darwin':
      command = `open "${url}"`;
      break;
    case 'win32':
      command = `start "" "${url}"`;
      break;
    default:
      command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`\nCould not open browser automatically.`);
      console.log(`Please open: ${url}`);
    }
  });
}

/**
 * Serve static file
 * @internal - Exported for testing
 */
export function serveStaticFile(
  res: ServerResponse,
  filePath: string
): boolean {
  if (!existsSync(filePath)) {
    return false;
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle SSE connection for live reload
 * @internal - Exported for testing
 */
export function handleSseConnection(res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection message
  res.write('data: connected\n\n');

  // Add to clients set
  sseClients.add(res);

  // Remove on close
  res.on('close', () => {
    sseClients.delete(res);
  });
}

/**
 * Notify all connected clients to reload
 * @internal - Exported for testing
 */
export function notifyReload(): void {
  for (const client of sseClients) {
    client.write('data: reload\n\n');
  }
}

/**
 * Handle HTTP requests
 * @internal - Exported for testing
 */
export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = req.url || '/';

  // Handle SSE endpoint for live reload
  if (url === '/__live-reload') {
    handleSseConnection(res);
    return;
  }

  // Handle API requests
  if (url.startsWith('/api/')) {
    const handled = await handleApiRequest(req, res);
    if (handled) return;

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Not found' }));
    return;
  }

  // Serve static files from GUI directory
  const guiDir = getGuiDir();
  let filePath = join(guiDir, url === '/' ? 'index.html' : url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(guiDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (serveStaticFile(res, filePath)) {
    return;
  }

  // Fallback to index.html for SPA routing
  filePath = join(guiDir, 'index.html');
  if (serveStaticFile(res, filePath)) {
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}

/**
 * Set up file watcher for live reload
 * @internal - Exported for testing
 */
export function setupFileWatcher(): void {
  const guiDir = getGuiDir();

  // Only watch if GUI directory exists (dev mode)
  if (!existsSync(guiDir)) return;

  // Skip file watcher in CI environments (recursive watch not supported on Linux)
  if (process.env.CI === 'true') return;

  console.log(`  👀 Watching for changes: ${guiDir}`);

  // Debounce to avoid multiple reloads
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(guiDir, { recursive: true }, (_eventType, filename) => {
    if (!filename) return;

    // Ignore non-relevant files
    const ext = extname(filename);
    if (!['.html', '.js', '.css'].includes(ext)) return;

    // Debounce notifications
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`  ↻ File changed: ${filename}`);
      notifyReload();
    }, 100);
  });
}

/**
 * Start the configuration server
 */
export async function startConfigServer(options: ConfigServerOptions = {}): Promise<void> {
  const { openBrowser: shouldOpenBrowser = true, port: requestedPort } = options;

  // Priority: 1) options.port, 2) PORT env var, 3) default 8765
  const startPort = requestedPort ?? (process.env.PORT ? parseInt(process.env.PORT, 10) : 8765);

  try {
    const port = await findAvailablePort(startPort);

    const server = createServer((req, res) => {
      handleRequest(req, res).catch((err) => {
        console.error('Request error:', err);
        res.writeHead(500);
        res.end('Internal server error');
      });
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(`\n  🎨 Claude Statusline Configuration\n`);
      console.log(`  Server running at: ${url}`);
      console.log(`  Live reload enabled`);
      console.log(`  Press Ctrl+C to stop\n`);

      if (shouldOpenBrowser) {
        openBrowser(url);
      }
    });

    // Set up file watcher for live reload
    setupFileWatcher();

    // Handle shutdown
    const shutdown = () => {
      console.log('\nShutting down...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
