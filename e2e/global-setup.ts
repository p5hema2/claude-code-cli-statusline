import type { FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 *
 * Note: Test isolation is handled by playwright.config.ts which:
 * 1. Creates a temp directory with test settings
 * 2. Passes TEST_SETTINGS_PATH to the webServer process
 * 3. The webServer (server.service.ts) uses TEST_SETTINGS_PATH for isolation
 *
 * This globalSetup function runs in a separate process and doesn't need to do anything.
 * The actual isolation happens in the webServer process which receives the correct env vars.
 */
async function globalSetup(_config: FullConfig) {
  // Test isolation is handled by webServer environment variables
  // See playwright.config.ts for test path setup
  console.log('[E2E Setup] Test isolation configured in webServer environment');
}

export default globalSetup;
