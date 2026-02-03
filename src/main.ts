/**
 * Claude Statusline - Main logic
 *
 * This module contains the core statusline functionality.
 * It's dynamically imported by index.ts after FORCE_COLOR is set.
 */

import { StatusJSONSchema } from './types/index.js';
import { loadUsageCache, waitForPendingRefresh, loadSettings, renderStatusLine } from './utils/index.js';

/**
 * Check for --configure flag and start configuration server
 */
async function checkConfigureFlag(): Promise<boolean> {
  if (process.argv.includes('--configure')) {
    const { startConfigServer } = await import('./configure/index.js');
    const noOpen = process.argv.includes('--no-open');
    await startConfigServer({ openBrowser: !noOpen });
    return true;
  }
  return false;
}

/**
 * Read all data from stdin
 *
 * Uses a debounce approach for Windows compatibility where the 'end' event
 * may be delayed. Resolves quickly after data stops arriving.
 */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return new Promise((resolve, reject) => {
    const resolveWithData = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      process.stdin.removeAllListeners();
      resolve(Buffer.concat(chunks).toString('utf-8'));
    };

    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      // Debounce: resolve 50ms after last data chunk (fast for piped input)
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(resolveWithData, 50);
    });

    process.stdin.on('end', resolveWithData);
    process.stdin.on('error', reject);

    // Fallback timeout if no data received at all
    setTimeout(() => {
      if (chunks.length === 0) {
        reject(new Error('No input received from stdin'));
      }
    }, 5000);
  });
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  try {
    // Check for --configure flag first
    if (await checkConfigureFlag()) {
      return;
    }

    // Read JSON from stdin
    const input = await readStdin();

    // Debug: log raw input if DEBUG env is set
    if (process.env.DEBUG) {
      const { writeFileSync } = await import('node:fs');
      const { homedir } = await import('node:os');
      writeFileSync(
        `${homedir()}/.claude/statusline-debug.json`,
        input,
        'utf-8'
      );
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch {
      console.error('Invalid JSON input');
      process.exit(1);
    }

    // Validate against schema
    const result = StatusJSONSchema.safeParse(parsed);
    if (!result.success) {
      console.error('Invalid status JSON schema');
      process.exit(1);
    }

    // Fallback: Use process.cwd() if current_dir is not provided
    // This ensures Directory and GitBranch widgets still work
    if (!result.data.current_dir) {
      result.data.current_dir = process.cwd();
    }

    // Load settings and usage cache
    const settings = loadSettings();
    const usage = await loadUsageCache(settings.cacheTtl);

    // Render status line
    const output = renderStatusLine({
      status: result.data,
      usage,
      terminalWidth: process.stdout.columns || 80,
      settings,
    });

    // Output to stdout
    console.log(output);

    // Wait for any pending cache refresh to complete before exiting
    // This ensures the refresh actually finishes (otherwise process.exit kills it)
    await waitForPendingRefresh();

    process.exit(0);
  } catch (error) {
    // Silently fail for statusline - don't break Claude Code
    if (process.env.DEBUG) {
      console.error('Statusline error:', error);
    }
    process.exit(1);
  }
}
