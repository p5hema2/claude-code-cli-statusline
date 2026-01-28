/**
 * Configuration server
 *
 * HTTP server that serves the configuration GUI and API endpoints.
 * Uses Node's built-in http module with no external dependencies.
 */

import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { createSocket } from 'node:dgram';
import { handleApiRequest } from './routes.js';

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
  // In dev: src/configure/server.ts -> src/configure/gui
  // In dist: dist/configure/server.js -> dist/configure/gui
  return join(currentFile, '..', 'gui');
}

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number): Promise<boolean> {
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
 */
async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available port found');
}

/**
 * Open URL in default browser
 */
function openBrowser(url: string): void {
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
 */
function serveStaticFile(
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

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle HTTP requests
 */
async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = req.url || '/';

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
 * Start the configuration server
 */
export async function startConfigServer(): Promise<void> {
  const startPort = 8765;

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
      console.log(`  Press Ctrl+C to stop\n`);

      openBrowser(url);
    });

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
