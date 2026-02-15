import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

interface ClaudeSettings {
  [key: string]: unknown;
}

/**
 * The command to register in Claude Code settings.json
 * Uses @latest tag to always pull the most recent version via npx.
 */
const STATUSLINE_COMMAND = 'npx @p5hema2/claude-code-cli-statusline@latest';

/**
 * Get the path to Claude Code settings.json
 * @returns Absolute path to ~/.claude/settings.json
 */
function getSettingsPath(): string {
  return resolve(homedir(), '.claude', 'settings.json');
}

/**
 * Setup service for Claude Code CLI statusline
 *
 * Removes all statusline entries (any casing) and adds the correct configuration.
 * Safe to run multiple times (idempotent).
 *
 * Exits with code 0 on success, code 1 on error.
 */
export async function setupClaudeCode(): Promise<void> {
  console.log('🚀 Setting up claude-code-cli-statusline...\n');

  const settingsPath = getSettingsPath();

  // 1. Check if settings.json exists
  if (!existsSync(settingsPath)) {
    console.error('❌ Claude Code settings.json not found at:', settingsPath);
    console.error('   Please ensure Claude Code CLI is installed.');
    process.exit(1);
  }

  // 2. Read current settings
  let settings: ClaudeSettings;
  try {
    const content = readFileSync(settingsPath, 'utf-8');
    settings = JSON.parse(content) as ClaudeSettings;
  } catch (error) {
    console.error('❌ Failed to read settings.json:', error instanceof Error ? error.message : String(error));
    console.error('   The settings file may be corrupted. Please check:', settingsPath);
    process.exit(1);
  }

  // 3. Remove all statusline entries (case-insensitive)
  const keysToRemove: string[] = [];
  for (const key in settings) {
    if (key.toLowerCase() === 'statusline') {
      keysToRemove.push(key);
    }
  }

  if (keysToRemove.length > 0) {
    console.log(`🧹 Removing ${keysToRemove.length} existing statusline entr${keysToRemove.length === 1 ? 'y' : 'ies'}...`);
    for (const key of keysToRemove) {
      delete settings[key];
    }
  }

  // 4. Add correct statusLine configuration
  settings.statusLine = {
    type: 'command',
    command: STATUSLINE_COMMAND,
  };

  // 5. Write back to settings.json
  try {
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  } catch (error) {
    console.error('❌ Failed to write settings.json:', error instanceof Error ? error.message : String(error));
    console.error('   Check file permissions for:', settingsPath);
    process.exit(1);
  }

  // 6. Success message
  console.log('✅ Successfully configured claude-code-cli-statusline!\n');
  console.log('Configuration saved to:', settingsPath);
  console.log();
  console.log('Next steps:');
  console.log('  1. Restart Claude Code CLI for changes to take effect');
  console.log(`  2. Run \`${STATUSLINE_COMMAND} --configure\` to customize`);
  console.log('  3. Check the statusline appears at the bottom of your terminal\n');
}
