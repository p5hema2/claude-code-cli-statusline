import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseTranscriptMetrics } from './transcript.util.js';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

import { readFileSync } from 'node:fs';

const mockReadFileSync = vi.mocked(readFileSync);

function makeEntry(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: 'message',
    timestamp: '2026-02-07T10:00:00.000Z',
    isSidechain: false,
    isApiErrorMessage: false,
    message: {
      role: 'assistant',
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: 30,
        cache_read_input_tokens: 20,
      },
    },
    ...overrides,
  });
}

describe('parseTranscriptMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate tokens from assistant messages', () => {
    const lines = [
      makeEntry({ timestamp: '2026-02-07T10:00:00.000Z' }),
      makeEntry({ timestamp: '2026-02-07T10:05:00.000Z' }),
    ].join('\n');

    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result).not.toBeNull();
    expect(result!.inputTokens).toBe(200);
    expect(result!.outputTokens).toBe(100);
    expect(result!.cacheCreationTokens).toBe(60);
    expect(result!.cacheReadTokens).toBe(40);
    expect(result!.cachedTokens).toBe(100);
    expect(result!.totalTokens).toBe(400);
    expect(result!.turnCount).toBe(2);
  });

  it('should compute session duration from timestamps', () => {
    const lines = [
      makeEntry({ timestamp: '2026-02-07T10:00:00.000Z' }),
      makeEntry({ timestamp: '2026-02-07T12:30:00.000Z' }),
    ].join('\n');

    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.sessionDurationMs).toBe(2.5 * 60 * 60 * 1000);
  });

  it('should skip sidechain messages', () => {
    const lines = [
      makeEntry({ isSidechain: false }),
      makeEntry({ isSidechain: true }),
    ].join('\n');

    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.inputTokens).toBe(100);
    expect(result!.turnCount).toBe(1);
  });

  it('should skip API error messages', () => {
    const lines = [
      makeEntry({ isApiErrorMessage: false }),
      makeEntry({ isApiErrorMessage: true }),
    ].join('\n');

    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.turnCount).toBe(1);
  });

  it('should skip user messages', () => {
    const userEntry = JSON.stringify({
      timestamp: '2026-02-07T10:00:00.000Z',
      isSidechain: false,
      message: { role: 'user', content: [{ type: 'text', text: 'hello' }] },
    });

    const lines = [makeEntry(), userEntry].join('\n');
    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.turnCount).toBe(1);
  });

  it('should handle malformed lines gracefully', () => {
    const lines = [
      makeEntry(),
      'not valid json {{{',
      makeEntry(),
    ].join('\n');

    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.turnCount).toBe(2);
  });

  it('should return null when file read fails', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = parseTranscriptMetrics('/nonexistent/path.jsonl');
    expect(result).toBeNull();
  });

  it('should return zero duration when only one timestamp', () => {
    const lines = makeEntry({ timestamp: '2026-02-07T10:00:00.000Z' });
    mockReadFileSync.mockReturnValue(lines);

    const result = parseTranscriptMetrics('/fake/path.jsonl');
    expect(result!.sessionDurationMs).toBe(0);
  });
});
