import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { SessionIdWidget } from './session-id.widget.js';

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

describe('SessionIdWidget', () => {
  it('should have correct name', () => {
    expect(SessionIdWidget.name).toBe('sessionId');
  });

  it('should render full session ID', () => {
    const ctx = makeCtx({ status: { session_id: 'abc123-def456' } });

    const result = SessionIdWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('abc123-def456');
  });

  it('should truncate with ellipsis when maxLength set', () => {
    const ctx = makeCtx({ status: { session_id: 'abc123-def456-ghi789' } });

    const config = { widget: 'sessionId', options: { maxLength: '8' } };
    const result = SessionIdWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('abc123-d…');
  });

  it('should not truncate when ID is shorter than maxLength', () => {
    const ctx = makeCtx({ status: { session_id: 'short' } });

    const config = { widget: 'sessionId', options: { maxLength: '12' } };
    const result = SessionIdWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('short');
  });

  it('should render with label', () => {
    const ctx = makeCtx({ status: { session_id: 'sess-42' } });

    const config = { widget: 'sessionId', options: { label: 'Session' } };
    const result = SessionIdWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Session: sess-42');
  });

  it('should return null when no session ID', () => {
    const ctx = makeCtx({ status: {} });

    const result = SessionIdWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'sessionId', options: { naVisibility: 'na' } };
    const result = SessionIdWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('N/A');
  });
});
