import { describe, it, expect } from 'vitest';
import { createUsageBar, createCompactUsage } from './colors.js';

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
