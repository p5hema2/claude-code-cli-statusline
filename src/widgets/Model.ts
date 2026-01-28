/**
 * Model widget
 *
 * Displays the current Claude model name in a shortened format.
 */

import chalk from 'chalk';
import type { Widget, RenderContext } from './Widget.js';

/**
 * Shorten model name for display
 *
 * Extracts the model family (Opus, Sonnet, Haiku) and preserves the full
 * version number including decimals.
 *
 * @example
 * shortenModelName('claude-sonnet-4-20250514') => 'Sonnet 4'
 * shortenModelName('Claude 4 Sonnet') => 'Sonnet 4'
 * shortenModelName('Claude Opus 4.5') => 'Opus 4.5'
 */
function shortenModelName(name: string): string {
  const lowerName = name.toLowerCase();

  // Match version numbers including decimals (e.g., "4", "4.5", "3.5")
  const versionMatch = name.match(/(\d+(?:\.\d+)?)/);
  const version = versionMatch ? versionMatch[1] : '';

  // Handle display names like "Claude Opus 4.5" or "Claude 4 Sonnet"
  if (lowerName.includes('opus')) {
    return version ? `Opus ${version}` : 'Opus';
  }
  if (lowerName.includes('sonnet')) {
    return version ? `Sonnet ${version}` : 'Sonnet';
  }
  if (lowerName.includes('haiku')) {
    return version ? `Haiku ${version}` : 'Haiku';
  }

  // Handle model IDs like "claude-sonnet-4-20250514"
  if (lowerName.startsWith('claude-')) {
    const parts = name.split('-');
    if (parts.length >= 3) {
      const family = parts[1];
      const familyCapitalized =
        family.charAt(0).toUpperCase() + family.slice(1);
      // Version is typically the third part (ignore date suffix)
      const ver = parts[2];
      return `${familyCapitalized} ${ver}`;
    }
  }

  // Fallback: truncate long names
  return name.length > 15 ? name.slice(0, 12) + '...' : name;
}

export const ModelWidget: Widget = {
  name: 'model',
  label: 'Model',

  render(ctx: RenderContext): string | null {
    const model = ctx.status.model;
    if (!model) return null;

    const name = model.display_name || model.id;
    if (!name) return null;

    const shortened = shortenModelName(name);
    return chalk.magenta(shortened);
  },
};
