import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setupClaudeCode } from './setup.service.js';

// Mock Node.js modules
vi.mock('node:fs');
vi.mock('node:os');
vi.mock('node:path');

describe('setupClaudeCode', () => {
  const mockHomedir = '/home/testuser';
  const mockSettingsPath = '/home/testuser/.claude/settings.json';

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(homedir).mockReturnValue(mockHomedir);
    vi.mocked(resolve).mockReturnValue(mockSettingsPath);

    // Mock console methods to suppress output in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock process.exit to prevent test termination
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit called with code ${code}`);
    }) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit with error if settings.json does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    await expect(setupClaudeCode()).rejects.toThrow('process.exit called with code 1');

    expect(console.error).toHaveBeenCalledWith(
      '❌ Claude Code settings.json not found at:',
      mockSettingsPath,
    );
  });

  it('should exit with error if settings.json is corrupted', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('{ invalid json }');

    await expect(setupClaudeCode()).rejects.toThrow('process.exit called with code 1');

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('❌ Failed to read settings.json:'),
      expect.any(String),
    );
  });

  it('should add statusline configuration to empty settings', async () => {
    const emptySettings = {};

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(emptySettings));

    let capturedContent = '';
    vi.mocked(writeFileSync).mockImplementation((_path, content) => {
      capturedContent = String(content);
    });

    await setupClaudeCode();

    const writtenSettings = JSON.parse(capturedContent);
    expect(writtenSettings.statusLine).toBeDefined();
    expect(writtenSettings.statusLine.type).toBe('command');
    expect(writtenSettings.statusLine.command).toBe(
      'npx @p5hema2/claude-code-cli-statusline@latest',
    );

    expect(console.log).toHaveBeenCalledWith(
      '✅ Successfully configured claude-code-cli-statusline!\n',
    );
  });

  it('should preserve existing settings when adding statusline', async () => {
    const existingSettings = {
      theme: 'dark',
      fontSize: 14,
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingSettings));

    let capturedContent = '';
    vi.mocked(writeFileSync).mockImplementation((_path, content) => {
      capturedContent = String(content);
    });

    await setupClaudeCode();

    const writtenSettings = JSON.parse(capturedContent);
    expect(writtenSettings.theme).toBe('dark');
    expect(writtenSettings.fontSize).toBe(14);
    expect(writtenSettings.statusLine).toBeDefined();
    expect(writtenSettings.statusLine.type).toBe('command');
    expect(writtenSettings.statusLine.command).toBe(
      'npx @p5hema2/claude-code-cli-statusline@latest',
    );
  });

  it('should exit with error if write fails due to permissions', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('{}');
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error('EACCES: permission denied');
    });

    await expect(setupClaudeCode()).rejects.toThrow('process.exit called with code 1');

    expect(console.error).toHaveBeenCalledWith(
      '❌ Failed to write settings.json:',
      'EACCES: permission denied',
    );
  });

  it('should remove incorrect lowercase statusline key', async () => {
    const settingsWithWrongKey = {
      statusline: {
        command: 'old-command',
      },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(settingsWithWrongKey));

    let capturedContent = '';
    vi.mocked(writeFileSync).mockImplementation((_path, content) => {
      capturedContent = String(content);
    });

    await setupClaudeCode();

    expect(console.log).toHaveBeenCalledWith('🧹 Removing 1 existing statusline entry...');

    const writtenSettings = JSON.parse(capturedContent);
    expect(writtenSettings.statusline).toBeUndefined();
    expect(writtenSettings.statusLine).toBeDefined();
    expect(writtenSettings.statusLine.type).toBe('command');
    expect(writtenSettings.statusLine.command).toBe(
      'npx @p5hema2/claude-code-cli-statusline@latest',
    );
  });

  it('should remove both correct and incorrect keys and add new one', async () => {
    const settingsWithBothKeys = {
      statusLine: {
        command: 'correct-command',
      },
      statusline: {
        command: 'incorrect-command',
      },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(settingsWithBothKeys));

    let capturedContent = '';
    vi.mocked(writeFileSync).mockImplementation((_path, content) => {
      capturedContent = String(content);
    });

    await setupClaudeCode();

    expect(console.log).toHaveBeenCalledWith('🧹 Removing 2 existing statusline entries...');

    const writtenSettings = JSON.parse(capturedContent);
    expect(writtenSettings.statusline).toBeUndefined();
    expect(writtenSettings.statusLine).toBeDefined();
    expect(writtenSettings.statusLine.type).toBe('command');
    expect(writtenSettings.statusLine.command).toBe(
      'npx @p5hema2/claude-code-cli-statusline@latest',
    );
  });

  it('should replace existing correct command with new one', async () => {
    const existingSettings = {
      statusLine: {
        command: 'node /path/to/local/dev/index.js',
      },
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingSettings));

    let capturedContent = '';
    vi.mocked(writeFileSync).mockImplementation((_path, content) => {
      capturedContent = String(content);
    });

    await setupClaudeCode();

    expect(console.log).toHaveBeenCalledWith('🧹 Removing 1 existing statusline entry...');

    const writtenSettings = JSON.parse(capturedContent);
    expect(writtenSettings.statusLine).toBeDefined();
    expect(writtenSettings.statusLine.type).toBe('command');
    expect(writtenSettings.statusLine.command).toBe(
      'npx @p5hema2/claude-code-cli-statusline@latest',
    );
  });
});
