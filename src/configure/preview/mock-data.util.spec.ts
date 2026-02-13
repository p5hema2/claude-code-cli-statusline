/**
 * Tests for schema-driven mock data utility
 */

import { describe, it, expect } from 'vitest';

import type { WidgetSchema } from '../../types/index.js';
import { mockCachedEntry, mockTimestampAt } from '../../widgets/index.js';

import { getDefaultWidgetStates, generateMockContext } from './mock-data.util.js';

/** Minimal schema factory for testing */
function makeSchema(id: string, previewStates: WidgetSchema['previewStates'] = []): WidgetSchema {
  return {
    id,
    meta: { displayName: id, description: '', category: 'session' },
    previewStates,
  };
}

describe('getDefaultWidgetStates', () => {
  it('should return first state ID per schema', () => {
    const schemas = [
      makeSchema('directory', [
        { id: 'short', label: 'Short', description: '' },
        { id: 'long', label: 'Long', description: '' },
      ]),
      makeSchema('model', [
        { id: 'sonnet', label: 'Sonnet', description: '' },
      ]),
    ];

    const defaults = getDefaultWidgetStates(schemas);
    expect(defaults).toEqual({ directory: 'short', model: 'sonnet' });
  });

  it('should skip schemas without previewStates', () => {
    const schemas = [
      makeSchema('separator'),
      makeSchema('text', []),
      makeSchema('model', [{ id: 'opus', label: 'Opus', description: '' }]),
    ];

    const defaults = getDefaultWidgetStates(schemas);
    expect(defaults).toEqual({ model: 'opus' });
  });
});

describe('generateMockContext', () => {
  it('should merge status partials from multiple widgets', () => {
    const schemas = [
      makeSchema('directory', [
        { id: 'short', label: 'Short', description: '', mockData: { status: { current_dir: '~/project' } } },
      ]),
      makeSchema('model', [
        { id: 'sonnet', label: 'Sonnet', description: '', mockData: { status: { model: { id: 'sonnet-4', display_name: 'Sonnet 4' } } } },
      ]),
    ];

    const { status } = generateMockContext({ directory: 'short', model: 'sonnet' }, schemas);
    expect(status.current_dir).toBe('~/project');
    expect(status.model?.display_name).toBe('Sonnet 4');
  });

  it('should return null usage when all usage widgets are noOAuth', () => {
    const schemas = [
      makeSchema('sessionUsage', [
        { id: 'noOAuth', label: 'No OAuth', description: '', mockData: { usage: null } },
      ]),
      makeSchema('weeklyUsage', [
        { id: 'noOAuth', label: 'No OAuth', description: '', mockData: { usage: null } },
      ]),
    ];

    const { usage } = generateMockContext(
      { sessionUsage: 'noOAuth', weeklyUsage: 'noOAuth' },
      schemas,
    );
    expect(usage).toBeNull();
  });

  it('should merge partial usage when some widgets are noOAuth and some are not', () => {
    const schemas = [
      makeSchema('sessionUsage', [
        { id: 'low', label: 'Low', description: '', mockData: { usage: { current_session: mockCachedEntry(20) } } },
      ]),
      makeSchema('weeklyUsage', [
        { id: 'noOAuth', label: 'No OAuth', description: '', mockData: { usage: null } },
      ]),
      makeSchema('weeklySonnet', [
        { id: 'high', label: 'High', description: '', mockData: { usage: { weekly_sonnet: mockCachedEntry(80) } } },
      ]),
    ];

    const { usage } = generateMockContext(
      { sessionUsage: 'low', weeklyUsage: 'noOAuth', weeklySonnet: 'high' },
      schemas,
    );

    expect(usage).not.toBeNull();
    expect(usage!.current_session.percent_used).toBe(20);
    expect(usage!.weekly_sonnet.percent_used).toBe(80);
    // weekly_all should be filled with zero default
    expect(usage!.weekly_all.percent_used).toBe(0);
  });

  it('should fill default usage fields for missing widget contributions', () => {
    const schemas = [
      makeSchema('sessionUsage', [
        { id: 'medium', label: 'Medium', description: '', mockData: { usage: { current_session: mockCachedEntry(50) } } },
      ]),
    ];

    const { usage } = generateMockContext({ sessionUsage: 'medium' }, schemas);

    expect(usage).not.toBeNull();
    expect(usage!.current_session.percent_used).toBe(50);
    // Other fields filled with zero defaults
    expect(usage!.weekly_all.percent_used).toBe(0);
    expect(usage!.weekly_sonnet.percent_used).toBe(0);
    expect(usage!.timestamp).toBeGreaterThan(0);
  });

  it('should return null gitInfo for notRepo state', () => {
    const schemas = [
      makeSchema('gitBranch', [
        { id: 'notRepo', label: 'Not Repo', description: '', mockData: { gitInfo: null } },
      ]),
    ];

    const { gitInfo } = generateMockContext({ gitBranch: 'notRepo' }, schemas);
    expect(gitInfo).toBeNull();
  });

  it('should return full GitInfo for git states', () => {
    const schemas = [
      makeSchema('gitBranch', [
        {
          id: 'dirty', label: 'Dirty', description: '',
          mockData: { gitInfo: { branch: 'main', isDirty: true, hasStaged: false, hasUntracked: false, ahead: 0, behind: 0 } },
        },
      ]),
    ];

    const { gitInfo } = generateMockContext({ gitBranch: 'dirty' }, schemas);
    expect(gitInfo).not.toBeNull();
    expect(gitInfo!.branch).toBe('main');
    expect(gitInfo!.isDirty).toBe(true);
  });

  it('should handle usage timestamp from usageAge widget', () => {
    const ts = mockTimestampAt(14, 15);
    const schemas = [
      makeSchema('usageAge', [
        { id: 'afternoon', label: 'Afternoon', description: '', mockData: { usage: { timestamp: ts } } },
      ]),
    ];

    const { usage } = generateMockContext({ usageAge: 'afternoon' }, schemas);
    expect(usage).not.toBeNull();
    expect(usage!.timestamp).toBe(ts);
  });
});
