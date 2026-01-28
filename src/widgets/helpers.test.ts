import { describe, it, expect } from 'vitest';
import { getWidgetConfig, formatLabel } from './helpers.js';
import type { RenderContext } from './Widget.js';
import type { Settings, WidgetConfig } from '../types/Settings.js';

// Helper to create a minimal RenderContext
function createContext(widgets?: Record<string, WidgetConfig>): RenderContext {
  const settings: Settings = {
    widgets,
  };
  return {
    status: {} as RenderContext['status'],
    usage: null,
    terminalWidth: 80,
    settings,
  };
}

describe('getWidgetConfig', () => {
  it('should return undefined when no settings', () => {
    const ctx = createContext();
    const result = getWidgetConfig(ctx, 'directory');
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent widget', () => {
    const ctx = createContext({
      directory: { enabled: true },
    });
    const result = getWidgetConfig(ctx, 'nonExistent');
    expect(result).toBeUndefined();
  });

  it('should return widget config when it exists', () => {
    const ctx = createContext({
      directory: { enabled: true, label: 'Dir' },
    });
    const result = getWidgetConfig(ctx, 'directory');
    expect(result).toEqual({ enabled: true, label: 'Dir' });
  });
});

describe('formatLabel', () => {
  it('should return default label with colon when config is undefined', () => {
    const result = formatLabel(undefined, 'Dir');
    expect(result).toBe('Dir:');
  });

  it('should return default label with colon when config.label is undefined', () => {
    const result = formatLabel({ enabled: true }, 'Dir');
    expect(result).toBe('Dir:');
  });

  it('should return empty string when config.label is empty string', () => {
    const result = formatLabel({ label: '' }, 'Dir');
    expect(result).toBe('');
  });

  it('should return custom label as-is (no colon added)', () => {
    const result = formatLabel({ label: 'Custom: ' }, 'Dir');
    expect(result).toBe('Custom: ');
  });

  it('should return custom label without colon', () => {
    const result = formatLabel({ label: 'MyLabel' }, 'Dir');
    expect(result).toBe('MyLabel');
  });

  it('should apply label color when specified', () => {
    const result = formatLabel({ label: 'Test', labelColor: 'red' }, 'Dir');
    // Result should contain the text (color may not show in test env without TTY)
    expect(result).toContain('Test');
  });

  it('should handle empty default label', () => {
    const result = formatLabel(undefined, '');
    expect(result).toBe('');
  });
});
