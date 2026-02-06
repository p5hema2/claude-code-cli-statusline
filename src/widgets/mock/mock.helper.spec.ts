/**
 * Tests for mock data helpers
 */

import { describe, it, expect } from 'vitest';

import { mockResetTime, mockCachedEntry, mockTimestampAt } from './mock.helper.js';

describe('mockResetTime', () => {
  it('should return a valid ISO string approximately 7 days ahead', () => {
    const result = mockResetTime();
    const parsed = new Date(result);

    expect(parsed.toISOString()).toBe(result);

    const diffMs = parsed.getTime() - Date.now();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);
    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });
});

describe('mockCachedEntry', () => {
  it('should return correct shape with given percent_used', () => {
    const entry = mockCachedEntry(50);

    expect(entry).toHaveProperty('reset_time');
    expect(entry).toHaveProperty('percent_used', 50);
    expect(new Date(entry.reset_time).toISOString()).toBe(entry.reset_time);
  });

  it('should handle 0% and 100%', () => {
    expect(mockCachedEntry(0).percent_used).toBe(0);
    expect(mockCachedEntry(100).percent_used).toBe(100);
  });
});

describe('mockTimestampAt', () => {
  it('should return a timestamp for today at the specified time', () => {
    const ts = mockTimestampAt(14, 15);
    const date = new Date(ts);
    const now = new Date();

    expect(date.getFullYear()).toBe(now.getFullYear());
    expect(date.getMonth()).toBe(now.getMonth());
    expect(date.getDate()).toBe(now.getDate());
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(15);
  });

  it('should handle midnight', () => {
    const ts = mockTimestampAt(0, 0);
    const date = new Date(ts);

    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });
});
