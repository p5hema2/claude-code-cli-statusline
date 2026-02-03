import chalk from 'chalk';
import { describe, it, expect } from 'vitest';

import {
  createUsageBar,
  createCompactUsage,
  getChalkColor,
  colorize,
} from './colors.util.js';

describe('createUsageBar', () => {
  it('should create bar for 0%', () => {
    const result = createUsageBar(0);
    expect(result).toContain('░░░░░░░░░░');
    expect(result).toContain('0%');
  });

  it('should create bar for 50%', () => {
    const result = createUsageBar(50);
    expect(result).toContain('█████░░░░░');
    expect(result).toContain('50%');
  });

  it('should create bar for 100%', () => {
    const result = createUsageBar(100);
    expect(result).toContain('██████████');
    expect(result).toContain('100%');
  });

  it('should clamp values above 100', () => {
    const result = createUsageBar(150);
    expect(result).toContain('100%');
  });

  it('should clamp values below 0', () => {
    const result = createUsageBar(-10);
    expect(result).toContain('0%');
  });
});

describe('createCompactUsage', () => {
  it('should format percentage', () => {
    const result = createCompactUsage(42);
    expect(result).toContain('42%');
  });

  it('should clamp values', () => {
    expect(createCompactUsage(-5)).toContain('0%');
    expect(createCompactUsage(200)).toContain('100%');
  });
});

describe('getChalkColor', () => {
  it('should return chalk for undefined color', () => {
    const result = getChalkColor(undefined);
    expect(result('test')).toBe('test');
  });

  it('should return a function for valid color', () => {
    const result = getChalkColor('red');
    expect(typeof result).toBe('function');
    // The result should at least contain the text
    expect(result('test')).toContain('test');
  });

  it('should return a function for dim modifier', () => {
    const result = getChalkColor('dim');
    expect(typeof result).toBe('function');
    expect(result('test')).toContain('test');
  });

  it('should handle all standard ANSI colors', () => {
    const colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;
    for (const color of colors) {
      const result = getChalkColor(color);
      expect(typeof result).toBe('function');
    }
  });
});

describe('colorize', () => {
  it('should return string containing text when color provided', () => {
    const result = colorize('hello', 'green');
    expect(result).toContain('hello');
  });

  it('should use fallback when no color provided', () => {
    const result = colorize('hello', undefined, chalk.blue);
    expect(result).toBe(chalk.blue('hello'));
  });

  it('should return plain text when no color or fallback', () => {
    const result = colorize('hello');
    expect(result).toBe('hello');
  });

  it('should use color when both color and fallback provided', () => {
    // Both should produce the same content
    const result = colorize('hello', 'red', chalk.blue);
    expect(result).toContain('hello');
  });
});

describe('createUsageBar with custom colors', () => {
  it('should accept custom bar colors', () => {
    const customColors = {
      low: 'cyan' as const,
      medium: 'magenta' as const,
      high: 'yellow' as const,
    };

    // Low percentage should use custom low color
    const lowResult = createUsageBar(20, customColors);
    expect(lowResult).toContain('20%');

    // High percentage should use custom high color
    const highResult = createUsageBar(90, customColors);
    expect(highResult).toContain('90%');
  });
});
