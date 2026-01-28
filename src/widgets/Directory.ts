/**
 * Directory widget
 *
 * Displays the current working directory in a fish-shell style
 * shortened format (e.g., ~/p/c/src instead of ~/projects/claude/src).
 */

import chalk from 'chalk';
import { homedir } from 'node:os';
import type { Widget, RenderContext } from './Widget.js';

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
  // Replace home directory with ~
  const home = homedir();
  let normalized = path.replace(/\\/g, '/');
  const homeNormalized = home.replace(/\\/g, '/');

  if (normalized.startsWith(homeNormalized)) {
    normalized = '~' + normalized.slice(homeNormalized.length);
  }

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

export const DirectoryWidget: Widget = {
  name: 'directory',
  label: 'Dir',

  render(ctx: RenderContext): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) return null;

    const shortened = shortenPath(dir);
    return chalk.blue(shortened);
  },
};
