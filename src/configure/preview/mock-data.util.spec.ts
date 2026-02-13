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

  describe('deep merge for nested status objects', () => {
    it('should deep merge token_metrics from multiple token widgets', () => {
      const schemas = [
        makeSchema('tokensInput', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { input_tokens: 1500 } } },
          },
        ]),
        makeSchema('tokensOutput', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { output_tokens: 500 } } },
          },
        ]),
        makeSchema('tokensCached', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { cached_tokens: 1000 } } },
          },
        ]),
        makeSchema('tokensTotal', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { total_tokens: 2000 } } },
          },
        ]),
        makeSchema('tokensCacheRead', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { cache_read_tokens: 5000 } } },
          },
        ]),
      ];

      const { status } = generateMockContext(
        {
          tokensInput: 'low',
          tokensOutput: 'low',
          tokensCached: 'low',
          tokensTotal: 'low',
          tokensCacheRead: 'low',
        },
        schemas,
      );

      // All token fields should be present (deep merge preserves all)
      expect(status.token_metrics?.input_tokens).toBe(1500);
      expect(status.token_metrics?.output_tokens).toBe(500);
      expect(status.token_metrics?.cached_tokens).toBe(1000);
      expect(status.token_metrics?.total_tokens).toBe(2000);
      expect(status.token_metrics?.cache_read_tokens).toBe(5000);
    });

    it('should deep merge cost fields from multiple session widgets', () => {
      const schemas = [
        makeSchema('sessionCost', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { cost: { total_cost_usd: 0.02 } } },
          },
        ]),
        makeSchema('apiDuration', [
          {
            id: 'fast',
            label: 'Fast',
            description: '',
            mockData: { status: { cost: { total_api_duration_ms: 800 } } },
          },
        ]),
        makeSchema('codeChanges', [
          {
            id: 'small',
            label: 'Small',
            description: '',
            mockData: { status: { cost: { total_lines_added: 23, total_lines_removed: 5 } } },
          },
        ]),
        makeSchema('turnCount', [
          {
            id: 'few',
            label: 'Few',
            description: '',
            mockData: { status: { turn_count: 3 } },
          },
        ]),
      ];

      const { status } = generateMockContext(
        {
          sessionCost: 'low',
          apiDuration: 'fast',
          codeChanges: 'small',
          turnCount: 'few',
        },
        schemas,
      );

      // All cost fields should be present (deep merge preserves all)
      expect(status.cost?.total_cost_usd).toBe(0.02);
      expect(status.cost?.total_api_duration_ms).toBe(800);
      expect(status.cost?.total_lines_added).toBe(23);
      expect(status.cost?.total_lines_removed).toBe(5);
      // turnCount is a top-level status field, not nested under cost
      expect(status.turn_count).toBe(3);
    });

    it('should not pollute prototype via __proto__ key', () => {
      const schemas = [
        makeSchema('malicious', [
          {
            id: 'attack',
            label: 'Attack',
            description: '',
            // Simulate a malicious schema (though in practice schemas are authored by devs)
            mockData: { status: { __proto__: { polluted: true } } as never },
          },
        ]),
      ];

      const { status } = generateMockContext({ malicious: 'attack' }, schemas);

      // The __proto__ key should be ignored by the guard
      expect(status).not.toHaveProperty('__proto__');
      expect(Object.prototype).not.toHaveProperty('polluted');
    });

    it('should handle mix of primitives and nested objects', () => {
      const schemas = [
        makeSchema('model', [
          {
            id: 'sonnet',
            label: 'Sonnet',
            description: '',
            mockData: { status: { model: { id: 'sonnet-4', display_name: 'Sonnet 4' } } },
          },
        ]),
        makeSchema('sessionId', [
          {
            id: 'default',
            label: 'Default',
            description: '',
            mockData: { status: { session_id: 'abc123' } },
          },
        ]),
        makeSchema('tokensInput', [
          {
            id: 'low',
            label: 'Low',
            description: '',
            mockData: { status: { token_metrics: { input_tokens: 1500 } } },
          },
        ]),
      ];

      const { status } = generateMockContext(
        { model: 'sonnet', sessionId: 'default', tokensInput: 'low' },
        schemas,
      );

      // Nested object
      expect(status.model?.id).toBe('sonnet-4');
      expect(status.model?.display_name).toBe('Sonnet 4');
      // Primitive
      expect(status.session_id).toBe('abc123');
      // Another nested object
      expect(status.token_metrics?.input_tokens).toBe(1500);
    });
  });
});
