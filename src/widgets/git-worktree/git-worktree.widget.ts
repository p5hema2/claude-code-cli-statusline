import type { Widget, RenderContext, WidgetConfig, WidgetSchema, ColorValue } from '../../types/index.js';
import { isGitRepo, getWorktreeName, colorize } from '../../utils/index.js';
import { getOption, renderWidgetWithLabel } from '../shared/widget.helper.js';

export const GitWorktreeSchema: WidgetSchema = {
  id: 'gitWorktree',
  meta: {
    displayName: 'Git Worktree',
    description: 'Current git worktree name',
    category: 'location',
  },
  options: {
    content: { color: 'cyan' },
    custom: [
      {
        key: 'icon',
        type: 'select',
        label: 'Icon',
        options: [
          { value: '𖠰', label: '𖠰 (branch)' },
          { value: '🌲', label: '🌲 (tree)' },
          { value: '⎇', label: '⎇ (branch alt)' },
          { value: '', label: 'None' },
        ],
        default: '𖠰',
      },
      { key: 'label', type: 'text', label: 'Label Prefix', default: '', maxLength: 20, placeholder: 'e.g., "Tree"' },
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
      id: 'worktree',
      label: 'Worktree',
      description: 'Inside a linked worktree',
      mockData: {
        gitInfo: {
          branch: 'feat/experiment', isDirty: false, hasStaged: false, hasUntracked: false,
          ahead: 0, behind: 0, worktreeName: 'feature-experiment',
        },
      },
    },
    {
      id: 'mainTree',
      label: 'Main Tree',
      description: 'Main working directory (not a linked worktree)',
      mockData: {
        gitInfo: {
          branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false,
          ahead: 0, behind: 0, worktreeName: null,
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

const DEFAULT_COLOR: ColorValue = 'cyan';

export const GitWorktreeWidget: Widget = {
  name: 'gitWorktree',

  render(ctx: RenderContext, config?: WidgetConfig): string | null {
    const dir = ctx.status.current_dir;
    if (!dir) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    let worktree: string | null;

    if (ctx.mockGitInfo !== undefined) {
      if (!ctx.mockGitInfo) {
        return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
      }
      worktree = ctx.mockGitInfo.worktreeName ?? null;
    } else {
      if (!isGitRepo(dir)) {
        return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
      }
      worktree = getWorktreeName(dir);
    }

    if (!worktree) {
      return renderWidgetWithLabel(null, config, DEFAULT_COLOR);
    }

    const icon = getOption<string>(config, 'icon') ?? '𖠰';
    const color = config?.color ?? DEFAULT_COLOR;
    const prefix = icon ? `${icon} ` : '';
    const content = colorize(`${prefix}${worktree}`, color);

    return renderWidgetWithLabel(content, config, DEFAULT_COLOR);
  },
};
