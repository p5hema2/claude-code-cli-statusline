/**
 * Tests for OAuth token retrieval and API calls
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { platform } from 'node:os';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getAccessToken, fetchUsage } from './oauth.util.js';

// Mock Node.js modules
vi.mock('node:child_process');
vi.mock('node:fs');
vi.mock('node:os');

// Mock fetch globally
globalThis.fetch = vi.fn();

describe('getAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('macOS (darwin)', () => {
    beforeEach(() => {
      vi.mocked(platform).mockReturnValue('darwin');
    });

    it('should extract token from nested structure (claudeAiOauth)', async () => {
      const mockCredentials = JSON.stringify({
        claudeAiOauth: {
          accessToken: 'test-token-nested',
          refreshToken: 'refresh-123',
          expiresAt: 1234567890,
        },
      });

      vi.mocked(execSync).mockReturnValue(mockCredentials as any);

      const token = await getAccessToken();
      expect(token).toBe('test-token-nested');
      expect(execSync).toHaveBeenCalledWith(
        'security find-generic-password -s "Claude Code-credentials" -w',
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
    });

    it('should fall back to legacy flat structure', async () => {
      const mockCredentials = JSON.stringify({
        accessToken: 'test-token-legacy',
        refreshToken: 'refresh-123',
      });

      vi.mocked(execSync).mockReturnValue(mockCredentials as any);

      const token = await getAccessToken();
      expect(token).toBe('test-token-legacy');
    });

    it('should return null if nested accessToken is missing', async () => {
      const mockCredentials = JSON.stringify({
        claudeAiOauth: {
          refreshToken: 'refresh-123',
        },
      });

      vi.mocked(execSync).mockReturnValue(mockCredentials as any);

      const token = await getAccessToken();
      expect(token).toBeNull();
    });

    it('should return null if keychain command fails', async () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Keychain error: password not found');
      });

      const token = await getAccessToken();
      expect(token).toBeNull();
    });

    it('should return null if keychain returns invalid JSON', async () => {
      vi.mocked(execSync).mockReturnValue('invalid-json' as any);

      const token = await getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('Windows/Linux', () => {
    beforeEach(() => {
      vi.mocked(platform).mockReturnValue('win32');
    });

    it('should read token from credentials file (nested structure)', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const mockCredentials = JSON.stringify({
        claudeAiOauth: {
          accessToken: 'test-token-file-nested',
          refreshToken: 'refresh-456',
        },
      });
      vi.mocked(readFileSync).mockReturnValue(mockCredentials);

      const token = await getAccessToken();
      expect(token).toBe('test-token-file-nested');
      expect(readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/.credentials.json'),
        'utf-8'
      );
    });

    it('should read token from credentials file (legacy structure)', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      const mockCredentials = JSON.stringify({
        accessToken: 'test-token-file-legacy',
      });
      vi.mocked(readFileSync).mockReturnValue(mockCredentials);

      const token = await getAccessToken();
      expect(token).toBe('test-token-file-legacy');
    });

    it('should return null if credentials file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const token = await getAccessToken();
      expect(token).toBeNull();
    });

    it('should return null if file read fails', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File read error');
      });

      const token = await getAccessToken();
      expect(token).toBeNull();
    });

    it('should return null if file contains invalid JSON', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid-json');

      const token = await getAccessToken();
      expect(token).toBeNull();
    });
  });
});

describe('fetchUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch usage data successfully', async () => {
    const mockResponse = {
      five_hour: {
        utilization: 0.25,
        resets_at: '2026-02-04T18:00:00Z',
      },
      seven_day: {
        utilization: 0.45,
        resets_at: '2026-02-08T00:00:00Z',
      },
      seven_day_sonnet: {
        utilization: 0.60,
        resets_at: '2026-02-08T00:00:00Z',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await fetchUsage('test-token-123');

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/api/oauth/usage',
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-123',
          'anthropic-beta': 'oauth-2025-04-20',
          'User-Agent': 'claude-code-cli-statusline/1.0.0',
        },
      }
    );
  });

  it('should return null if API returns non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await fetchUsage('invalid-token');
    expect(result).toBeNull();
  });

  it('should return null if fetch throws network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const result = await fetchUsage('test-token');
    expect(result).toBeNull();
  });

  it('should return null if JSON parsing fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await fetchUsage('test-token');
    expect(result).toBeNull();
  });

  it('should send correct headers including User-Agent', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await fetchUsage('token-123');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'claude-code-cli-statusline/1.0.0',
          'anthropic-beta': 'oauth-2025-04-20',
        }),
      })
    );
  });
});
