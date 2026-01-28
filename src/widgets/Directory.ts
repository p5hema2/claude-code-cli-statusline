/**
 * Directory widget
 *
 * Displays the current working directory in a configurable format:
 * - 'shortened': fish-shell style (~/p/c/src) - default
 * - 'full': full path (~/projects/claude/src)
 * - 'project-only': just the current directory name (src)
 */

import chalk from 'chalk';
import { homedir } from 'node:os';
import type { Widget, RenderContext } from './Widget.js';
import type { DirectoryOptions } from '../types/WidgetOptions.js';
import { getWidgetConfig, formatLabel } from './helpers.js';
import { colorize } from '../utils/colors.js';

/**
 * Normalize path and replace home directory with ~
 */
function normalizePath(path: string): string {
  const home = homedir();
  let normalized = path.replace(/\\/g, '/');
  const homeNormalized = home.replace(/\\/g, '/');

  if (normalized.startsWith(homeNormalized)) {
    normalized = '~' + normalized.slice(homeNormalized.length);
  }
  return normalized;
}

/**
 * Shorten a path to fish-shell style
 *
 * Each path component except the last is shortened to its first character.
 * The home directory is replaced with ~.
 *
 * @example
 * shortenPath('/home/user/projects/claude/src') => '~/p/c/src'
 */
function shortenPath(path: string): string {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return '/';

  // Keep the last part full, shorten others
  const shortened = parts.map((part, i) => {
    if (i === parts.length - 1) return part;
    // Handle ~ specially
    if (part === '~') return '~';
    return part[0];
  });

  // Handle absolute paths vs relative paths starting with ~
  const prefix = normalized.startsWith('~') ? '' : '/';
  return prefix + shortened.join('/');
}

/**
 * Get just the project/directory name
 */
function getProjectName(path: string): string {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  return parts[parts.length - 1] || '/';
}

/**
 * Format path based on options
 */
function formatPath(path: string, options?: DirectoryOptions): string {
  const format = options?.format ?? 'shortened';

  switch (format) {
    case 'full': {
      const normalized = normalizePath(path);
      const maxLen = options?.maxLength ?? 50;
      if (normalized.length > maxLen) {
        return '...' + normalized.slice(-(maxLen - 3));
      }
      return normalized;
    }
    case 'project-only':
      return getProjectName(path);
    case 'shortened':
    default:
      return shortenPath(path);
  }
}

export const DirectoryWidget: Widget = {
  name: 'directory',
  label: 'Dir',

  render(ctx: RenderContext): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) return null;

    const config = getWidgetConfig(ctx, 'directory');
    const options = config?.options as DirectoryOptions | undefined;

    const formatted = formatPath(dir, options);
    const label = formatLabel(config, 'Dir');
    const content = colorize(formatted, config?.contentColor, chalk.blue);

    return label + content;
  },
};
