import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { isGitRepo, getDiffStats, colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/index.js';

export const GitChangesSchema: WidgetSchema = {
  id: 'gitChanges',
  meta: {
    displayName: 'Git Changes',
    description: 'Git diff statistics (insertions/deletions)',
    category: 'git',
  },
  options: {
    content: { color: 'white' },
    custom: [
      { key: 'insertionColor', type: 'color', label: 'Insertion Color', default: 'green' },
      { key: 'deletionColor', type: 'color', label: 'Deletion Color', default: 'red' },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Diff"' },
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
      id: 'changes',
      label: 'Changes',
      description: 'Insertions and deletions present',
      mockData: {
        gitInfo: {
          branch: 'main', isDirty: true, hasStaged: false, hasUntracked: false,
          ahead: 0, behind: 0, diffStats: { insertions: 42, deletions: 10 },
        },
      },
    },
    {
      id: 'insertionsOnly',
      label: 'Insertions Only',
      description: 'Only new lines added',
      mockData: {
        gitInfo: {
          branch: 'main', isDirty: true, hasStaged: false, hasUntracked: false,
          ahead: 0, behind: 0, diffStats: { insertions: 15, deletions: 0 },
        },
      },
    },
    {
      id: 'noChanges',
      label: 'No Changes',
      description: 'Clean working directory',
      mockData: {
        gitInfo: {
          branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
          ahead: 0, behind: 0, diffStats: { insertions: 0, deletions: 0 },
        },
      },
    },
    {
      id: 'notRepo',
      label: 'Not a Repo',
      description: 'Not a git repository',
      mockData: { gitInfo: null },
    },
  ],
};

const DEFAULT_INSERTION_COLOR: ColorValue = 'green';
const DEFAULT_DELETION_COLOR: ColorValue = 'red';

export const GitChangesWidget: Widget = {
  name: 'gitChanges',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) {
      return renderWidgetWithLabel(null, config, 'white');
    }

    let stats: { insertions: number; deletions: number };

    if (ctx.mockGitInfo !== undefined) {
      if (!ctx.mockGitInfo) {
        return renderWidgetWithLabel(null, config, 'white');
      }
      stats = ctx.mockGitInfo.diffStats ?? { insertions: 0, deletions: 0 };
    } else {
      if (!isGitRepo(dir)) {
        return renderWidgetWithLabel(null, config, 'white');
      }
      stats = getDiffStats(dir);
    }

    const insColor = getOption<ColorValue>(config, 'insertionColor') ?? DEFAULT_INSERTION_COLOR;
    const delColor = getOption<ColorValue>(config, 'deletionColor') ?? DEFAULT_DELETION_COLOR;

    const content = `${colorize(`+${stats.insertions}`, insColor)},${colorize(`-${stats.deletions}`, delColor)}`;
    return renderWidgetWithLabel(content, config, 'white');
  },
};
