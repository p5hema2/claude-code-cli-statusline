/**
 * Context usage widget tests
 */

import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { ContextUsageWidget } from './context-usage.widget.js';

describe('ContextUsageWidget', () => {
  it('should have correct name', () => {
    expect(ContextUsageWidget.name).toBe('contextUsage');
  });

  it('should render context percentage', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: { remaining_percentage: 75 },
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ContextUsageWidget.render(ctx);
    expect(result).toBeTruthy();
    // TODO: Add more specific assertions about usage bar
  });

  it('should return null when no context window data', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const result = ContextUsageWidget.render(ctx);
    expect(result).toBeNull();
  });

  // Label tests
  it('should render with label', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: { remaining_percentage: 50 },
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'contextUsage', options: { label: 'Ctx' } };
    const result = ContextUsageWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toContain('Ctx:');
  });

  it('should show N/A when null and naVisibility=na', () => {
    const ctx: RenderContext = {
      status: {
        current_dir: '/test',
        model: undefined,
        vim_mode: undefined,
        context_window: undefined,
        output_style: undefined,
      },
      usage: null,
      terminalWidth: 80,
      settings: {},
    };

    const config = { widget: 'contextUsage', options: { naVisibility: 'na' } };
    const result = ContextUsageWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
