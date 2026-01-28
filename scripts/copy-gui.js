/**
 * Copy GUI static files to dist directory
 *
 * This script copies the GUI assets (HTML, CSS, JS) to the dist folder
 * so they can be served by the configuration server.
 */

import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const srcGui = join(rootDir, 'src', 'configure', 'gui');
const distGui = join(rootDir, 'dist', 'configure', 'gui');

// Ensure dist directory exists
if (!existsSync(dirname(distGui))) {
  mkdirSync(dirname(distGui), { recursive: true });
}

// Copy GUI files
try {
  cpSync(srcGui, distGui, { recursive: true });
  console.log('✓ GUI files copied to dist/configure/gui');
} catch (error) {
  console.error('Failed to copy GUI files:', error.message);
  process.exit(1);
}
