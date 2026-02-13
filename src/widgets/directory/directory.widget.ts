/**
 * Directory widget
 *
 * Displays the current working directory in a configurable format:
 * - 'shortened': fish-shell style (~/p/c/src) - default
 * - 'full': full path (~/projects/claude/src)
 * - 'project-only': just the current directory name (src)
 */

import { homedir } from 'node:os';

import type { Widget, RenderContext, WidgetConfig, WidgetSchema } from '../../types/index.js';
import { getOption, colorizeWithConfig, renderWidgetWithLabel } from '../shared/index.js';

/** Directory widget schema - defines all GUI metadata */
export const DirectorySchema: WidgetSchema = {
  id: 'directory',
  meta: {
    displayName: 'Directory',
    description: 'Current working directory path',
    category: 'environment',
  },
  options: {
    content: { color: 'blue' },
    custom: [
      {
        key: 'format',
        type: 'select',
        label: 'Path Format',
        options: [
          { value: 'shortened', label: 'Shortened (~/p/c/src)' },
          { value: 'full', label: 'Full Path' },
          { value: 'project-only', label: 'Project Name Only' },
        ],
        default: 'shortened',
      },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Dir"' },
      { key: 'labelColor', type: 'color', label: 'Label Color', default: 'dim' },
      {
        key: 'naVisibility',
        type: 'select',
        label: 'Visibility on N/A',
        options: [
          { value: 'hide', label: 'Hide widget' },
          { value: 'na', label: 'Show "N/A"' },
          { value: 'dash', label: 'Show "-"' },
          { value: 'empty', label: 'Show empty' },
        ],
        default: 'hide',
      },
    ],
  },
  previewStates: [
    {
      id: 'short', label: 'Short Path', description: 'Show ~/project',
      mockData: { status: { current_dir: '~/my-project' } },
    },
    {
      id: 'long', label: 'Long Path', description: 'Show full path',
      mockData: { status: { current_dir: '/home/user/projects/my-awesome-app/src/components' } },
    },
  ],
};

/** Directory format type */
type DirectoryFormat = 'shortened' | 'full' | 'project-only';

/** Directory options from inline config */
interface DirectoryOptions {
  format?: DirectoryFormat;
  maxLength?: number;
}

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

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const dir = ctx.status.current_dir;

    // Handle null content with naVisibility option
    if (!dir) {
      return renderWidgetWithLabel(null, config, 'blue');
    }

    const options: DirectoryOptions = {
      format: getOption<DirectoryFormat>(config, 'format'),
      maxLength: getOption<number>(config, 'maxLength'),
    };

    const formatted = formatPath(dir, options);
    const colored = colorizeWithConfig(formatted, config, undefined, 'blue');
    return renderWidgetWithLabel(colored, config, 'blue');
  },
};
