import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { CodeChangesWidget } from './code-changes.widget.js';

describe('CodeChangesWidget', () => {
  it('should have correct name', () => {
    expect(CodeChangesWidget.name).toBe('codeChanges');
  });

  it('should return null when cost is undefined', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = CodeChangesWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should render additions and deletions', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_lines_added: 156, total_lines_removed: 23 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = CodeChangesWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('+156');
    expect(plain).toContain('-23');
  });

  it('should render additions only', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_lines_added: 89, total_lines_removed: 0 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = CodeChangesWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('+89');
    expect(plain).not.toContain('-');
  });

  it('should render deletions only', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_lines_added: 0, total_lines_removed: 42 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = CodeChangesWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toContain('-42');
    expect(plain).not.toContain('+');
  });

  it('should return null when both are zero', () => {
    const ctx: RenderContext = {
      status: { current_dir: '/test', model: undefined, vim_mode: undefined, context_window: undefined, output_style: undefined, cost: { total_lines_added: 0, total_lines_removed: 0 } },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = CodeChangesWidget.render(ctx);
    expect(result).toBeNull();
  });
});
