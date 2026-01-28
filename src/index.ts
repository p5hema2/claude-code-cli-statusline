#!/usr/bin/env node
/**
 * Claude Statusline - Main entry point
 *
 * A customizable statusline for Claude Code CLI with OAuth usage metrics.
 *
 * Usage:
 *   claude-code-cli-statusline < status.json
 *
 * The statusline reads JSON from stdin (piped from Claude Code) and outputs
 * a formatted status line to stdout.
 */

import { StatusJSONSchema } from './types/StatusJSON.js';
import { loadUsageCache } from './utils/cache.js';
import { loadSettings } from './utils/config.js';
import { renderStatusLine } from './utils/renderer.js';

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
async function main(): Promise<void> {
  try {
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

    // Exit immediately - don't wait for background tasks
    process.exit(0);
  } catch (error) {
    // Silently fail for statusline - don't break Claude Code
    if (process.env.DEBUG) {
      console.error('Statusline error:', error);
    }
    process.exit(1);
  }
}

main();
