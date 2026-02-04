/**
 * Tests for settings management
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { Settings } from '../types/index.js';

import { loadSettings, saveSettings, getDefaultSettings, getSettingsPath } from './config.util.js';

// Mock Node.js modules
vi.mock('node:fs');

describe('getSettingsPath', () => {
  it('should return settings path', () => {
    const path = getSettingsPath();
    expect(path).toContain('.claude/statusline-settings.json');
  });
});

describe('getDefaultSettings', () => {
  it('should return default settings object', () => {
    const defaults = getDefaultSettings();
    expect(defaults).toHaveProperty('rows');
    expect(defaults).toHaveProperty('cacheTtl');
    expect(Array.isArray(defaults.rows)).toBe(true);
  });

  it('should return a new object each time (not mutate original)', () => {
    const defaults1 = getDefaultSettings();
    const defaults2 = getDefaultSettings();

    expect(defaults1).toEqual(defaults2);
    expect(defaults1).not.toBe(defaults2); // Different object references
  });
});

describe('loadSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load settings from disk when file exists', () => {
    const mockSettings: Settings = {
      rows: [[{ widget: 'directory' }, { widget: 'gitBranch' }]],
      cacheTtl: 120000,
    };

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSettings));

    const settings = loadSettings();
    expect(settings).toEqual(mockSettings);
    expect(readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('statusline-settings.json'),
      'utf-8'
    );
  });

  it('should return default settings if file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const settings = loadSettings();
    const defaults = getDefaultSettings();
    expect(settings).toEqual(defaults);
  });

  it('should return default settings if file read fails', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('File read error');
    });

    const settings = loadSettings();
    const defaults = getDefaultSettings();
    expect(settings).toEqual(defaults);
  });

  it('should return default settings if JSON parsing fails', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('invalid-json');

    const settings = loadSettings();
    const defaults = getDefaultSettings();
    expect(settings).toEqual(defaults);
  });

  describe('Settings Migration', () => {
    it('should migrate from old simple string array format', () => {
      const oldSettings = {
        rows: [['directory', 'gitBranch'], ['model', 'vimMode']],
        cacheTtl: 60000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(oldSettings));

      const settings = loadSettings();

      expect(settings.rows).toHaveLength(2);
      expect(settings.rows![0]).toEqual([
        { widget: 'directory' },
        { widget: 'gitBranch' },
      ]);
      expect(settings.rows![1]).toEqual([
        { widget: 'model' },
        { widget: 'vimMode' },
      ]);
    });

    it('should migrate from old object format with widgets property', () => {
      const oldSettings = {
        rows: [
          { widgets: ['directory', 'gitBranch'] },
          { widgets: ['model'] },
        ],
        cacheTtl: 60000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(oldSettings));

      const settings = loadSettings();

      expect(settings.rows).toHaveLength(2);
      expect(settings.rows![0]).toEqual([
        { widget: 'directory' },
        { widget: 'gitBranch' },
      ]);
    });

    it('should migrate widget colors from old widgets object', () => {
      const oldSettings = {
        rows: [['directory', 'gitBranch']],
        widgets: {
          directory: {
            contentColor: 'blue',
            options: {
              colors: { label: 'cyan' },
            },
          },
          gitBranch: {
            contentColor: 'green',
          },
        },
        cacheTtl: 60000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(oldSettings));

      const settings = loadSettings();

      expect(settings.rows![0][0]).toEqual({
        widget: 'directory',
        color: 'blue',
        colors: { label: 'cyan' },
      });
      expect(settings.rows![0][1]).toEqual({
        widget: 'gitBranch',
        color: 'green',
      });
    });

    it('should not migrate if already in new format', () => {
      const newSettings: Settings = {
        rows: [
          [
            { widget: 'directory', color: 'blue' },
            { widget: 'gitBranch' },
          ],
        ],
        cacheTtl: 60000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(newSettings));

      const settings = loadSettings();
      expect(settings).toEqual(newSettings);
    });

    it('should use default rows if invalid rows structure', () => {
      const invalidSettings = {
        rows: 'invalid-rows',
        cacheTtl: 60000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(invalidSettings));

      const settings = loadSettings();
      const defaults = getDefaultSettings();
      expect(settings.rows).toEqual(defaults.rows);
    });

    it('should preserve cacheTtl during migration', () => {
      const oldSettings = {
        rows: [['directory']],
        cacheTtl: 180000,
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(oldSettings));

      const settings = loadSettings();
      expect(settings.cacheTtl).toBe(180000);
    });
  });
});

describe('saveSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save settings to disk', () => {
    const settings: Settings = {
      rows: [[{ widget: 'directory' }]],
      cacheTtl: 90000,
    };

    vi.mocked(existsSync).mockReturnValue(true);

    saveSettings(settings);

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('statusline-settings.json'),
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
  });

  it('should create directory if it does not exist', () => {
    const settings: Settings = {
      rows: [[{ widget: 'model' }]],
      cacheTtl: 60000,
    };

    vi.mocked(existsSync).mockReturnValue(false);

    saveSettings(settings);

    expect(mkdirSync).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true }
    );
    expect(writeFileSync).toHaveBeenCalled();
  });

  it('should format JSON with 2-space indentation', () => {
    const settings: Settings = {
      rows: [[{ widget: 'directory' }, { widget: 'gitBranch' }]],
      cacheTtl: 60000,
    };

    vi.mocked(existsSync).mockReturnValue(true);

    saveSettings(settings);

    const savedJson = vi.mocked(writeFileSync).mock.calls[0][1] as string;
    expect(savedJson).toContain('\n');
    expect(savedJson).toContain('  '); // 2-space indent
  });

  it('should save settings with widget configurations', () => {
    const settings: Settings = {
      rows: [
        [
          {
            widget: 'directory',
            color: 'blue',
            colors: { label: 'cyan' },
            options: { maxLength: 50 },
          },
        ],
      ],
      cacheTtl: 120000,
    };

    vi.mocked(existsSync).mockReturnValue(true);

    saveSettings(settings);

    const savedJson = vi.mocked(writeFileSync).mock.calls[0][1] as string;
    const parsed = JSON.parse(savedJson) as Settings;
    expect(parsed.rows![0][0]).toEqual({
      widget: 'directory',
      color: 'blue',
      colors: { label: 'cyan' },
      options: { maxLength: 50 },
    });
  });
});
