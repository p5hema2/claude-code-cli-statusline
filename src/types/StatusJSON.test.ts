import { describe, it, expect } from 'vitest';
import { StatusJSONSchema } from './StatusJSON.js';

describe('StatusJSONSchema', () => {
  it('should parse valid status JSON', () => {
    const input = {
      current_dir: '/home/user/project',
      model: {
        id: 'claude-sonnet-4-20250514',
        display_name: 'Claude 4 Sonnet',
      },
      context_window: {
        remaining_percentage: 75,
      },
      output_style: {
        name: 'concise',
      },
      vim_mode: {
        mode: 'normal',
      },
    };

    const result = StatusJSONSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.current_dir).toBe('/home/user/project');
      expect(result.data.model?.display_name).toBe('Claude 4 Sonnet');
    }
  });

  it('should accept empty object', () => {
    const result = StatusJSONSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial data', () => {
    const result = StatusJSONSchema.safeParse({
      current_dir: '/tmp',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.current_dir).toBe('/tmp');
      expect(result.data.model).toBeUndefined();
    }
  });

  it('should pass through unknown fields', () => {
    const input = {
      current_dir: '/test',
      unknown_field: 'value',
    };
    const result = StatusJSONSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).unknown_field).toBe('value');
    }
  });
});
