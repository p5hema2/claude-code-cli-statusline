/**
 * OAuth token retrieval and API calls
 *
 * Handles reading OAuth credentials from the appropriate platform-specific
 * location and fetching usage data from the Anthropic API.
 */

import { homedir, platform } from 'node:os';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import type { UsageResponse } from '../types/UsageData.js';

/** OAuth credentials structure */
interface OAuthCredentials {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/** Credentials file structure stored by Claude Code */
interface CredentialsFile {
  claudeAiOauth?: OAuthCredentials;
  // Legacy flat structure (fallback)
  accessToken?: string;
}

/**
 * Get the OAuth access token from the appropriate platform location
 *
 * - macOS: Reads from Keychain using `security` command
 * - Windows/Linux: Reads from ~/.claude/.credentials.json file
 *
 * @returns Access token string or null if not available
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    if (platform() === 'darwin') {
      // macOS: Read from Keychain
      const result = execSync(
        'security find-generic-password -s "Claude Code-credentials" -w',
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const parsed: CredentialsFile = JSON.parse(result.trim());
      // Try nested structure first, then legacy flat structure
      return parsed.claudeAiOauth?.accessToken ?? parsed.accessToken ?? null;
    } else {
      // Windows/Linux: Read from credentials file
      const credFile = `${homedir()}/.claude/.credentials.json`;
      if (existsSync(credFile)) {
        const data: CredentialsFile = JSON.parse(readFileSync(credFile, 'utf-8'));
        // Try nested structure first, then legacy flat structure
        return data.claudeAiOauth?.accessToken ?? data.accessToken ?? null;
      }
    }
  } catch {
    // Silently fail - user may not be authenticated
  }
  return null;
}

/**
 * Fetch usage data from the Anthropic OAuth API
 *
 * @param token - OAuth access token
 * @returns Usage response or null if request fails
 */
export async function fetchUsage(
  token: string
): Promise<UsageResponse | null> {
  try {
    const response = await fetch('https://api.anthropic.com/api/oauth/usage', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'anthropic-beta': 'oauth-2025-04-20',
        'User-Agent': 'claude-code-cli-statusline/1.0.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as UsageResponse;
  } catch {
    return null;
  }
}
