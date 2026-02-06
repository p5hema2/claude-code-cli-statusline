import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { VersionWidget } from './version.widget.js';

function makeCtx(overrides?: Partial<RenderContext>): RenderContext {
  return {
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
    ...overrides,
  };
}

describe('VersionWidget', () => {
  it('should have correct name', () => {
    expect(VersionWidget.name).toBe('version');
  });

  it('should render version with v prefix', () => {
    const ctx = makeCtx({ status: { version: '1.0.20' } });

    const result = VersionWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('v1.0.20');
  });

  it('should render without v prefix when showPrefix is false', () => {
    const ctx = makeCtx({ status: { version: '2.0.0-beta.3' } });

    const config = { widget: 'version', options: { showPrefix: false } };
    const result = VersionWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('2.0.0-beta.3');
  });

  it('should render with label', () => {
    const ctx = makeCtx({ status: { version: '1.2.3' } });

    const config = { widget: 'version', options: { label: 'CLI' } };
    const result = VersionWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('CLI: v1.2.3');
  });

  it('should return null when no version', () => {
    const ctx = makeCtx({ status: {} });

    const result = VersionWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'version', options: { naVisibility: 'na' } };
    const result = VersionWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
