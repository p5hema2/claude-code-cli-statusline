/**
 * Tests for statusline renderer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { RenderContext, Widget, WidgetConfig } from '../types/index.js';

import {
  renderStatusLine,
  renderStatusLineRows,
  renderWidget,
  getWidgetNames,
} from './renderer.util.js';

// Mock WIDGET_REGISTRY with factory function
vi.mock('../widgets/index.js', () => {
  const mockDirectoryWidget: Widget = {
    name: 'directory',
    render: (ctx: any) => ctx.status.current_dir || null,
  };

  const mockGitBranchWidget: Widget = {
    name: 'gitBranch',
    render: (ctx: any) => (ctx.mockGitInfo?.branch ? `[${ctx.mockGitInfo.branch}]` : null),
  };

  const mockModelWidget: Widget = {
    name: 'model',
    render: (ctx: any) => ctx.status.model?.display_name || ctx.status.model?.id || null,
  };

  const mockSeparatorWidget: Widget = {
    name: 'separator',
    render: () => '|',
  };

  return {
    WIDGET_REGISTRY: {
      directory: { widget: mockDirectoryWidget, schema: {} },
      gitBranch: { widget: mockGitBranchWidget, schema: {} },
      model: { widget: mockModelWidget, schema: {} },
      separator: { widget: mockSeparatorWidget, schema: {} },
    },
  };
});

describe('renderStatusLine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render single row with multiple widgets', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [{ widget: 'directory' }, { widget: 'separator' }, { widget: 'model' }],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir | sonnet');
  });

  it('should render multiple rows with newline separator', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [{ widget: 'directory' }],
          [{ widget: 'model' }],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir\nsonnet');
  });

  it('should skip null widgets', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      mockGitInfo: null,
      settings: {
        rows: [
          [
            { widget: 'directory' },
            { widget: 'separator' },
            { widget: 'gitBranch' }, // Returns null (no git info)
            { widget: 'separator' },
            { widget: 'model' },
          ],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir | sonnet');
  });

  it('should remove leading separators', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      mockGitInfo: null,
      settings: {
        rows: [
          [
            { widget: 'separator' },
            { widget: 'gitBranch' }, // Returns null
            { widget: 'separator' },
            { widget: 'directory' },
          ],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir');
  });

  it('should remove trailing separators', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      mockGitInfo: null,
      settings: {
        rows: [
          [
            { widget: 'directory' },
            { widget: 'separator' },
            { widget: 'gitBranch' }, // Returns null
            { widget: 'separator' },
          ],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir');
  });

  it('should collapse consecutive separators', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [
            { widget: 'directory' },
            { widget: 'separator' },
            { widget: 'separator' },
            { widget: 'separator' },
            { widget: 'model' },
          ],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir | sonnet');
  });

  it('should skip empty rows', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: undefined,
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [{ widget: 'directory' }], // Returns null
          [{ widget: 'model' }],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('sonnet');
  });

  it('should return empty string if no rows configured', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('');
  });

  it('should handle git info in context', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      mockGitInfo: { branch: 'main', isDirty: false, hasStaged: false, hasUntracked: false, ahead: 0, behind: 0 },
      settings: {
        rows: [
          [{ widget: 'directory' }, { widget: 'separator' }, { widget: 'gitBranch' }],
        ],
      },
    };

    const result = renderStatusLine(ctx);
    expect(result).toBe('/test/dir | [main]');
  });
});

describe('renderStatusLineRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return array of rendered rows', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [{ widget: 'directory' }],
          [{ widget: 'model' }],
        ],
      },
    };

    const result = renderStatusLineRows(ctx);
    expect(result).toEqual(['/test/dir', 'sonnet']);
  });

  it('should include empty strings for rows with no output', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: undefined,
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [
          [{ widget: 'directory' }], // Returns null
          [{ widget: 'model' }],
        ],
      },
    };

    const result = renderStatusLineRows(ctx);
    expect(result).toEqual(['', 'sonnet']);
  });

  it('should return empty array if no rows configured', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {
        rows: [],
      },
    };

    const result = renderStatusLineRows(ctx);
    expect(result).toEqual([]);
  });
});

describe('renderWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render widget by name', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = renderWidget('directory', ctx);
    expect(result).toBe('/test/dir');
  });

  it('should return null for non-existent widget', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = renderWidget('nonexistent', ctx);
    expect(result).toBeNull();
  });

  it('should pass config to widget', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test/dir',
        model: { display_name: 'sonnet' },
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config: WidgetConfig = {
      widget: 'directory',
      color: 'blue',
    };

    const result = renderWidget('directory', ctx, config);
    expect(result).toBe('/test/dir');
  });
});

describe('getWidgetNames', () => {
  it('should return array of widget names', () => {
    const names = getWidgetNames();
    expect(names).toEqual(['directory', 'gitBranch', 'model', 'separator']);
  });
});
