/**
 * Directory widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { DirectoryWidget } from './directory.widget.js';

describe('DirectoryWidget', () => {
  it('should have correct name', () => {
    expect(DirectoryWidget.name).toBe('directory');
  });

  it('should render shortened path', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects/app/src',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = DirectoryWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions
  });

  it('should return null when no directory', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = DirectoryWidget.render(ctx);
    expect(result).toBeNull();
  });

  // Label functionality tests
  it('should render with label when label option provided', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'directory', options: { label: 'Dir' } };
    const result = DirectoryWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Dir:');
    expect(plain).toMatch(/Dir: .+/); // Label followed by path content
  });

  it('should render unchanged when label is empty', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/home/user/projects',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'directory', options: { label: '' } };
    const result = DirectoryWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).not.toContain('Dir:');
  });

  // N/A visibility tests
  it('should hide widget when directory null and naVisibility=hide (default)', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'directory', options: { naVisibility: 'hide' } };
    const result = DirectoryWidget.render(ctx, config);
    expect(result).toBeNull();
  });

  it('should show N/A when directory null and naVisibility=na', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = {
      widget: 'directory',
      options: { naVisibility: 'na', label: 'Dir' }
    };
    const result = DirectoryWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Dir: N/A');
  });

  it('should show dash when directory null and naVisibility=dash', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = {
      widget: 'directory',
      options: { naVisibility: 'dash', label: 'Dir' }
    };
    const result = DirectoryWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Dir: -');
  });

  it('should show empty when directory null and naVisibility=empty', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = {
      widget: 'directory',
      options: { naVisibility: 'empty', label: 'Dir' }
    };
    const result = DirectoryWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Dir: ');
  });
});
