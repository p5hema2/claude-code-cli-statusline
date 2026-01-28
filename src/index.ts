#!/usr/bin/env node
/**
 * Claude Statusline - Bootstrap entry point
 *
 * A customizable statusline for Claude Code CLI with OAuth usage metrics.
 *
 * Usage:
 *   claude-code-cli-statusline < status.json     # Normal mode
 *   claude-code-cli-statusline --configure       # Open configuration GUI
 *
 * This file sets environment variables BEFORE loading any modules,
 * then dynamically imports the main logic. This ensures FORCE_COLOR
 * is set before chalk is loaded (ESM hoists static imports).
 */

// Force colors BEFORE any imports
// This must happen before chalk is loaded through any import chain
process.env.FORCE_COLOR = '1';

// Dynamic import ensures FORCE_COLOR is set first
import('./main.js').then(({ main }) => main());
