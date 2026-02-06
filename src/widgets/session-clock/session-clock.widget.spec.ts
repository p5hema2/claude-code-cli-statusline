import { describe, it, expect } from 'vitest';

import type { RenderContext } from '../../types/index.js';
import { stripAnsi } from '../../utils/index.js';

import { SessionClockWidget } from './session-clock.widget.js';

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

describe('SessionClockWidget', () => {
  it('should have correct name', () => {
    expect(SessionClockWidget.name).toBe('sessionClock');
  });

  it('should render session duration', () => {
    const ctx = makeCtx({ status: { session_duration: '2hr 15m' } });

    const result = SessionClockWidget.render(ctx);
    expect(result).toBeTruthy();
    const plain = stripAnsi(result!);
    expect(plain).toBe('2hr 15m');
  });

  it('should render with label', () => {
    const ctx = makeCtx({ status: { session_duration: '45m' } });

    const config = { widget: 'sessionClock', options: { label: 'Session' } };
    const result = SessionClockWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Session: 45m');
  });

  it('should return null when no session duration', () => {
    const ctx = makeCtx({ status: {} });

    const result = SessionClockWidget.render(ctx);
    expect(result).toBeNull();
  });

  it('should show N/A when no data and naVisibility=na', () => {
    const ctx = makeCtx({ status: {} });

    const config = { widget: 'sessionClock', options: { naVisibility: 'na', label: 'Session' } };
    const result = SessionClockWidget.render(ctx, config);
    const plain = stripAnsi(result!);
    expect(plain).toBe('Session: N/A');
  });

  // Transcript-hydrated scenarios (formatDuration output formats)
  it('should render transcript-hydrated short duration', () => {
    const ctx = makeCtx({ status: { session_duration: '<1m' } });

    const result = SessionClockWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe('<1m');
  });

  it('should render transcript-hydrated hours-only duration', () => {
    const ctx = makeCtx({ status: { session_duration: '3hr' } });

    const result = SessionClockWidget.render(ctx);
    const plain = stripAnsi(result!);
    expect(plain).toBe('3hr');
  });
});
