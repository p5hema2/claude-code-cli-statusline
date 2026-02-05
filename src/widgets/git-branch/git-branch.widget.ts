/**
 * Git branch widget
 *
 * Displays the current git branch with configurable status indicators:
 * - * for dirty (uncommitted changes)
 * - + for staged changes
 * - ? for untracked files
 * - ↑N for commits ahead of remote
 * - ↓N for commits behind remote
 *
 * Supports customizable colors for different git states and custom symbols.
 */

import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { getGitInfo, colorize, type GitInfo } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

/** Git branch widget schema - defines all GUI metadata */
export const GitBranchSchema: WidgetSchema = {
  id: 'gitBranch',
  meta: {
    displayName: 'Git Branch',
    description: 'Git branch name with status indicators',
    category: 'location',
  },
  options: {
    custom: [
      // Branch name
      { key: 'branchColor', type: 'color', label: 'Branch Name', default: 'white' },

      // Dirty indicator (uncommitted changes)
      {
        key: 'dirtySymbol', type: 'select', label: 'Dirty Symbol',
        options: [
          { value: '*', label: '* (asterisk)' },
          { value: '●', label: '● (bullet)' },
          { value: '✗', label: '✗ (cross)' },
          { value: '!', label: '! (exclamation)' },
        ],
        default: '*',
      },
      { key: 'dirtyColor', type: 'color', label: 'Dirty Color', default: 'red' },
      { key: 'showDirty', type: 'checkbox', label: 'Show Dirty', default: true },

      // Staged indicator (changes ready to commit)
      {
        key: 'stagedSymbol', type: 'select', label: 'Staged Symbol',
        options: [
          { value: '+', label: '+ (plus)' },
          { value: '●', label: '● (bullet)' },
          { value: '✓', label: '✓ (check)' },
          { value: '◆', label: '◆ (diamond)' },
        ],
        default: '+',
      },
      { key: 'stagedColor', type: 'color', label: 'Staged Color', default: 'green' },
      { key: 'showStaged', type: 'checkbox', label: 'Show Staged', default: true },

      // Untracked indicator (new files)
      {
        key: 'untrackedSymbol', type: 'select', label: 'Untracked Symbol',
        options: [
          { value: '?', label: '? (question)' },
          { value: '…', label: '… (ellipsis)' },
          { value: '◌', label: '◌ (circle)' },
          { value: '+', label: '+ (plus)' },
        ],
        default: '?',
      },
      { key: 'untrackedColor', type: 'color', label: 'Untracked Color', default: 'yellow' },
      { key: 'showUntracked', type: 'checkbox', label: 'Show Untracked', default: true },

      // Ahead indicator (local commits not pushed)
      {
        key: 'aheadSymbol', type: 'select', label: 'Ahead Symbol',
        options: [
          { value: '↑', label: '↑ (arrow up)' },
          { value: '⬆', label: '⬆ (thick up)' },
          { value: '▲', label: '▲ (triangle)' },
          { value: '+', label: '+ (plus)' },
        ],
        default: '↑',
      },
      { key: 'aheadColor', type: 'color', label: 'Ahead Color', default: 'cyan' },
      { key: 'showAhead', type: 'checkbox', label: 'Show Ahead', default: true },

      // Behind indicator (remote commits not pulled)
      {
        key: 'behindSymbol', type: 'select', label: 'Behind Symbol',
        options: [
          { value: '↓', label: '↓ (arrow down)' },
          { value: '⬇', label: '⬇ (thick down)' },
          { value: '▼', label: '▼ (triangle)' },
          { value: '-', label: '- (minus)' },
        ],
        default: '↓',
      },
      { key: 'behindColor', type: 'color', label: 'Behind Color', default: 'red' },
      { key: 'showBehind', type: 'checkbox', label: 'Show Behind', default: true },

      // Label options
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Branch"' },
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
    // Basic states
    { id: 'clean', label: 'Clean', description: 'No uncommitted changes' },
    { id: 'dirty', label: 'Dirty', description: 'Uncommitted changes only' },
    { id: 'staged', label: 'Staged', description: 'Staged changes only' },
    { id: 'untracked', label: 'Untracked', description: 'Untracked files only' },
    // Remote states
    { id: 'ahead', label: 'Ahead', description: 'Local commits not pushed' },
    { id: 'behind', label: 'Behind', description: 'Remote commits not pulled' },
    { id: 'diverged', label: 'Diverged', description: 'Both ahead and behind remote' },
    // Combined states
    { id: 'mixed', label: 'Mixed', description: 'Dirty + staged + untracked' },
    { id: 'working', label: 'Working', description: 'All indicators active' },
    // Special states
    { id: 'detached', label: 'Detached', description: 'Detached HEAD state' },
    { id: 'notRepo', label: 'Not a Repo', description: 'Not a git repository' },
  ],
};

/** Git branch symbols type */
interface GitBranchSymbols {
  dirty?: string;
  staged?: string;
  untracked?: string;
  ahead?: string;
  behind?: string;
}

/** Default symbols for git status indicators */
const DEFAULT_SYMBOLS: Required<GitBranchSymbols> = {
  dirty: '*',
  staged: '+',
  untracked: '?',
  ahead: '↑',
  behind: '↓',
};

/** Colors for each git status indicator */
interface IndicatorColors {
  dirty: ColorValue;
  staged: ColorValue;
  untracked: ColorValue;
  ahead: ColorValue;
  behind: ColorValue;
}

/** Visibility settings for each indicator */
interface IndicatorVisibility {
  dirty: boolean;
  staged: boolean;
  untracked: boolean;
  ahead: boolean;
  behind: boolean;
}

/** Default colors for git status indicators */
const DEFAULT_INDICATOR_COLORS: IndicatorColors = {
  dirty: 'red',
  staged: 'green',
  untracked: 'yellow',
  ahead: 'cyan',
  behind: 'red',
};

/**
 * Format git status indicators with custom symbols, colors, and visibility
 *
 * Each indicator (dirty, staged, untracked, ahead, behind) can have its own
 * symbol, color, and can be individually shown or hidden.
 */
function formatIndicators(
  info: GitInfo,
  symbols: Required<GitBranchSymbols>,
  colors: IndicatorColors,
  visibility: IndicatorVisibility
): string {
  const parts: string[] = [];

  if (visibility.dirty && info.isDirty) {
    parts.push(colorize(symbols.dirty, colors.dirty));
  }
  if (visibility.staged && info.hasStaged) {
    parts.push(colorize(symbols.staged, colors.staged));
  }
  if (visibility.untracked && info.hasUntracked) {
    parts.push(colorize(symbols.untracked, colors.untracked));
  }
  if (visibility.ahead && info.ahead > 0) {
    parts.push(colorize(`${symbols.ahead}${info.ahead}`, colors.ahead));
  }
  if (visibility.behind && info.behind > 0) {
    parts.push(colorize(`${symbols.behind}${info.behind}`, colors.behind));
  }

  return parts.join('');
}

/** Default color for the branch name */
const DEFAULT_BRANCH_COLOR: ColorValue = 'white';

export const GitBranchWidget: Widget = {
  name: 'gitBranch',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    // Use mock git info if available (preview mode), otherwise get real git info
    const gitInfo = ctx.mockGitInfo !== undefined ? ctx.mockGitInfo : getGitInfo(dir);
    if (!gitInfo) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    // Get symbols with defaults
    const symbols: Required<GitBranchSymbols> = {
      dirty: getOption<string>(config, 'dirtySymbol') ?? DEFAULT_SYMBOLS.dirty,
      staged: getOption<string>(config, 'stagedSymbol') ?? DEFAULT_SYMBOLS.staged,
      untracked: getOption<string>(config, 'untrackedSymbol') ?? DEFAULT_SYMBOLS.untracked,
      ahead: getOption<string>(config, 'aheadSymbol') ?? DEFAULT_SYMBOLS.ahead,
      behind: getOption<string>(config, 'behindSymbol') ?? DEFAULT_SYMBOLS.behind,
    };

    // Get indicator colors (each has its own default)
    const indicatorColors: IndicatorColors = {
      dirty: getOption<ColorValue>(config, 'dirtyColor') ?? DEFAULT_INDICATOR_COLORS.dirty,
      staged: getOption<ColorValue>(config, 'stagedColor') ?? DEFAULT_INDICATOR_COLORS.staged,
      untracked: getOption<ColorValue>(config, 'untrackedColor') ?? DEFAULT_INDICATOR_COLORS.untracked,
      ahead: getOption<ColorValue>(config, 'aheadColor') ?? DEFAULT_INDICATOR_COLORS.ahead,
      behind: getOption<ColorValue>(config, 'behindColor') ?? DEFAULT_INDICATOR_COLORS.behind,
    };

    // Get indicator visibility (all shown by default)
    const visibility: IndicatorVisibility = {
      dirty: getOption<boolean>(config, 'showDirty') ?? true,
      staged: getOption<boolean>(config, 'showStaged') ?? true,
      untracked: getOption<boolean>(config, 'showUntracked') ?? true,
      ahead: getOption<boolean>(config, 'showAhead') ?? true,
      behind: getOption<boolean>(config, 'showBehind') ?? true,
    };

    const indicatorStr = formatIndicators(gitInfo, symbols, indicatorColors, visibility);
    const branch = gitInfo.branch;

    // Get branch color (single color for all states)
    const branchColor = getOption<ColorValue>(config, 'branchColor') ?? DEFAULT_BRANCH_COLOR;
    const branchStr = colorize(branch, branchColor);

    const content = branchStr + indicatorStr;
    return renderWidgetWithLabel(content, config, 'white');
  },
};
