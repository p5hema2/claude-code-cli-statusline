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
  })
  .passthrough();

export type StatusJSON = z.infer<typeof StatusJSONSchema>;
