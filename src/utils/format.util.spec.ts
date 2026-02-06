import { describe, it, expect } from 'vitest';

import { formatTokens } from './format.util.js';

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
