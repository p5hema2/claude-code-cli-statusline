/**
 * Transcript JSONL parser
 *
 * Parses Claude Code session transcript files to extract token usage,
 * session duration, and turn count metrics.
 */

import { readFileSync } from 'node:fs';

/** Aggregated metrics from a transcript file */
export interface TranscriptMetrics {
  /** Total input tokens consumed */
  inputTokens: number;
  /** Total output tokens generated */
  outputTokens: number;
  /** Total cache creation input tokens */
  cacheCreationTokens: number;
  /** Total cache read input tokens */
  cacheReadTokens: number;
  /** Combined cached tokens (creation + read) */
  cachedTokens: number;
  /** Grand total of all token types */
  totalTokens: number;
  /** Session duration in milliseconds (first to last timestamp) */
  sessionDurationMs: number;
  /** Number of assistant turns (non-sidechain) */
  turnCount: number;
}

/** Shape of a transcript JSONL line's usage object */
interface TranscriptUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

/** Minimal shape of a transcript JSONL line */
interface TranscriptEntry {
  type?: string;
  isSidechain?: boolean;
  isApiErrorMessage?: boolean;
  timestamp?: string;
  message?: {
    role?: string;
    usage?: TranscriptUsage;
  };
}

/**
 * Parse a transcript JSONL file and aggregate token metrics
 *
 * Reads the file, filters for non-sidechain assistant messages with usage
 * data, and sums all token categories. Also computes session duration from
 * first to last timestamp.
 *
 * @param path - Absolute path to the JSONL transcript file
 * @returns Aggregated metrics, or null on any error
 */
export function parseTranscriptMetrics(path: string): TranscriptMetrics | null {
  try {
    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n').filter(Boolean);

    let inputTokens = 0;
    let outputTokens = 0;
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;
    let turnCount = 0;
    let firstTimestamp: number | null = null;
    let lastTimestamp: number | null = null;

    for (const line of lines) {
      let entry: TranscriptEntry;
      try {
        entry = JSON.parse(line) as TranscriptEntry;
      } catch {
        continue;
      }

      // Track timestamps from all entries for session duration
      if (entry.timestamp) {
        const ts = new Date(entry.timestamp).getTime();
        if (!isNaN(ts)) {
          if (firstTimestamp === null || ts < firstTimestamp) firstTimestamp = ts;
          if (lastTimestamp === null || ts > lastTimestamp) lastTimestamp = ts;
        }
      }

      // Only count non-sidechain assistant messages with usage data
      if (entry.isSidechain) continue;
      if (entry.isApiErrorMessage) continue;
      if (entry.message?.role !== 'assistant') continue;

      const usage = entry.message.usage;
      if (!usage) continue;

      inputTokens += usage.input_tokens ?? 0;
      outputTokens += usage.output_tokens ?? 0;
      cacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
      cacheReadTokens += usage.cache_read_input_tokens ?? 0;
      turnCount++;
    }

    const cachedTokens = cacheCreationTokens + cacheReadTokens;
    const totalTokens = inputTokens + outputTokens + cachedTokens;
    const sessionDurationMs =
      firstTimestamp !== null && lastTimestamp !== null
        ? lastTimestamp - firstTimestamp
        : 0;

    return {
      inputTokens,
      outputTokens,
      cacheCreationTokens,
      cacheReadTokens,
      cachedTokens,
      totalTokens,
      sessionDurationMs,
      turnCount,
    };
  } catch {
    return null;
  }
}
