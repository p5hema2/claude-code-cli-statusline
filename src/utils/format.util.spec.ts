import { describe, it, expect } from 'vitest';

import { formatTokens, formatDuration, formatCost } from './format.util.js';

describe('formatTokens', () => {
  it('should format millions', () => {
    expect(formatTokens(1_500_000)).toBe('1.5M');
    expect(formatTokens(2_000_000)).toBe('2.0M');
  });

  it('should format thousands', () => {
    expect(formatTokens(15_200)).toBe('15.2k');
    expect(formatTokens(1_000)).toBe('1.0k');
    expect(formatTokens(999_999)).toBe('1000.0k');
  });

  it('should return raw number below 1000', () => {
    expect(formatTokens(500)).toBe('500');
    expect(formatTokens(0)).toBe('0');
    expect(formatTokens(999)).toBe('999');
  });
});

describe('formatDuration', () => {
  it('should format hours and minutes', () => {
    expect(formatDuration(2 * 60 * 60_000 + 15 * 60_000)).toBe('2hr 15m');
  });

  it('should format hours only when no minutes', () => {
    expect(formatDuration(3 * 60 * 60_000)).toBe('3hr');
  });

  it('should format minutes only', () => {
    expect(formatDuration(45 * 60_000)).toBe('45m');
  });

  it('should return <1m for very short durations', () => {
    expect(formatDuration(30_000)).toBe('<1m');
    expect(formatDuration(0)).toBe('<1m');
  });
});

describe('formatCost', () => {
  it('should format small costs', () => {
    expect(formatCost(0.01)).toBe('$0.01');
  });

  it('should format larger costs', () => {
    expect(formatCost(12.5)).toBe('$12.50');
  });

  it('should format zero cost', () => {
    expect(formatCost(0)).toBe('$0.00');
  });
});
