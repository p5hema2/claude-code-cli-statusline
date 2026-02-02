import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Tests the configuration GUI's drag-drop, preview, and settings management
 */

// Use separate port for tests to avoid conflicts with dev server
const TEST_PORT = '18765';

// Generate test settings path BEFORE config export (so it's available when webServer.env is evaluated)
// Use a fixed timestamp per test run (stored in env var) to ensure all workers use the same directory
if (!process.env.TEST_RUN_ID) {
  process.env.TEST_RUN_ID = Date.now().toString();
}

const TEST_TEMP_DIR = join(tmpdir(), `claude-statusline-test-${process.env.TEST_RUN_ID}`);
const TEST_SETTINGS_PATH = join(TEST_TEMP_DIR, 'statusline-settings.json');

// Create test directory and settings file (only once - first worker wins)
try {
  mkdirSync(TEST_TEMP_DIR, { recursive: true });

  // Use default settings format (new format with widget objects)
  const defaultSettings = {
    cacheTtl: 60000,
    rows: [
      [
        { widget: 'directory', color: 'blue' },
        { widget: 'separator' },
        { widget: 'gitBranch' },
      ],
      [
        { widget: 'model' },
        { widget: 'separator' },
        { widget: 'contextUsage' },
      ],
    ],
  };

  writeFileSync(TEST_SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
  console.log(`[Playwright Config] Test settings created: ${TEST_SETTINGS_PATH}`);
} catch (err) {
  // Directory/file already created by another worker - this is fine
  console.log(`[Playwright Config] Using existing test settings: ${TEST_SETTINGS_PATH}`);
}

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],

  use: {
    baseURL: `http://localhost:${TEST_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for multi-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Start configure server before tests
  webServer: {
    command: `node dist/index.js --configure --no-open --port ${TEST_PORT}`,
    url: `http://localhost:${TEST_PORT}`,
    reuseExistingServer: false, // Never reuse - ensures clean test environment
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      PORT: TEST_PORT, // Ensure server uses test port
      TEST_SETTINGS_PATH, // Pass test settings path to server
      TEST_TEMP_DIR, // Pass temp dir for cleanup
    },
  },
});
