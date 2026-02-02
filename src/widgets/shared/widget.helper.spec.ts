import { describe, it, expect } from 'vitest';

import type { WidgetConfig } from '../../types/index.js';

import { getColor, getOption, colorizeWithConfig } from './widget.helper.js';

describe('getColor', () => {
  it('should return undefined when config is undefined', () => {
    const result = getColor(undefined);
    expect(result).toBeUndefined();
  });

  it('should return simple color when no state specified', () => {
    const config: WidgetConfig = { widget: 'test', color: 'blue' };
    const result = getColor(config);
    expect(result).toBe('blue');
  });

  it('should return state-based color when state matches', () => {
    const config: WidgetConfig = {
      widget: 'test',
      colors: { clean: 'green', dirty: 'yellow' },
    };
    const result = getColor(config, 'dirty');
    expect(result).toBe('yellow');
  });

  it('should fall back to simple color when state not found', () => {
    const config: WidgetConfig = {
      widget: 'test',
      color: 'blue',
      colors: { clean: 'green' },
    };
    const result = getColor(config, 'unknown');
    expect(result).toBe('blue');
  });

  it('should prefer state color over simple color', () => {
    const config: WidgetConfig = {
      widget: 'test',
      color: 'blue',
      colors: { dirty: 'yellow' },
    };
    const result = getColor(config, 'dirty');
    expect(result).toBe('yellow');
  });
});

describe('getOption', () => {
  it('should return undefined when config is undefined', () => {
    const result = getOption<string>(undefined, 'format');
    expect(result).toBeUndefined();
  });

  it('should return undefined when options not set', () => {
    const config: WidgetConfig = { widget: 'test' };
    const result = getOption<string>(config, 'format');
    expect(result).toBeUndefined();
  });

  it('should return option value when set', () => {
    const config: WidgetConfig = {
      widget: 'test',
      options: { format: 'full' },
    };
    const result = getOption<string>(config, 'format');
    expect(result).toBe('full');
  });

  it('should return boolean options', () => {
    const config: WidgetConfig = {
      widget: 'test',
      options: { showBar: false },
    };
    const result = getOption<boolean>(config, 'showBar');
    expect(result).toBe(false);
  });
});

describe('colorizeWithConfig', () => {
  it('should return text with color from config', () => {
    const config: WidgetConfig = { widget: 'test', color: 'blue' };
    const result = colorizeWithConfig('hello', config);
    // Result should contain the text (color codes may vary by env)
    expect(result).toContain('hello');
  });

  it('should use state-based color when state provided', () => {
    const config: WidgetConfig = {
      widget: 'test',
      colors: { active: 'green' },
    };
    const result = colorizeWithConfig('hello', config, 'active');
    expect(result).toContain('hello');
  });

  it('should use fallback color when no config color', () => {
    const config: WidgetConfig = { widget: 'test' };
    const result = colorizeWithConfig('hello', config, undefined, 'cyan');
    expect(result).toContain('hello');
  });

  it('should return plain text when no color available', () => {
    const result = colorizeWithConfig('hello', undefined);
    expect(result).toBe('hello');
  });
});
