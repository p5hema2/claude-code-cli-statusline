/**
 * Zod schema for Claude Code status JSON input
 *
 * This schema validates the JSON payload that Claude Code sends to the statusline.
 * Using .passthrough() allows unknown fields to pass through without validation errors,
 * ensuring forward compatibility when Claude Code adds new fields.
 */

import { z } from 'zod';

export const StatusJSONSchema = z
  .object({
    /** Current working directory path */
    current_dir: z.string().optional(),

    /** Model information */
    model: z
      .object({
        /** Internal model identifier (e.g., "claude-sonnet-4-20250514") */
        id: z.string().optional(),
        /** Human-readable model name (e.g., "Claude 4 Sonnet") */
        display_name: z.string().optional(),
      })
      .optional(),

    /** Context window usage information */
    context_window: z
      .object({
        /** Percentage of context window remaining (0-100) */
        remaining_percentage: z.number().optional(),
      })
      .optional(),

    /** Output style configuration */
    output_style: z
      .object({
        /** Name of the current output style */
        name: z.string().optional(),
      })
      .optional(),

    /** Vim mode state */
    vim_mode: z
      .object({
        /** Current vim mode (e.g., "normal", "insert") */
        mode: z.string().optional(),
      })
      .optional(),

    /** Session duration (e.g., "2hr 15m", "45m") */
    session_duration: z.string().optional(),

    /** Session identifier */
    session_id: z.string().optional(),

    /** CLI version string (e.g., "1.2.3") */
    version: z.string().optional(),

    /** Granular token usage metrics */
    token_metrics: z
      .object({
        /** Input tokens consumed */
        input_tokens: z.number().optional(),
        /** Output tokens generated */
        output_tokens: z.number().optional(),
        /** Cached tokens (cache_creation + cache_read) */
        cached_tokens: z.number().optional(),
        /** Cache read input tokens */
        cache_read_tokens: z.number().optional(),
        /** Total tokens (all categories summed) */
        total_tokens: z.number().optional(),
      })
      .optional(),

    /** Path to the session transcript JSONL file */
    transcript_path: z.string().optional(),

    /** Cost and duration metrics from Claude Code */
    cost: z
      .object({
        /** Total session cost in USD */
        total_cost_usd: z.number().optional(),
        /** Total wall-clock duration in milliseconds */
        total_duration_ms: z.number().optional(),
        /** Total API call duration in milliseconds */
        total_api_duration_ms: z.number().optional(),
        /** Total lines of code added */
        total_lines_added: z.number().optional(),
        /** Total lines of code removed */
        total_lines_removed: z.number().optional(),
      })
      .optional(),

    /** Whether context usage exceeds 200K tokens */
    exceeds_200k_tokens: z.boolean().optional(),

    /** Number of conversation turns */
    turn_count: z.number().optional(),
  })
  .passthrough();

export type StatusJSON = z.infer<typeof StatusJSONSchema>;
