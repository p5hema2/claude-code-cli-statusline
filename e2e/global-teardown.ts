import { rmSync, existsSync } from 'node:fs';

import type { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  const tempDir = process.env.TEST_TEMP_DIR;

  if (tempDir && existsSync(tempDir)) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
      console.log(`[E2E Teardown] Cleaned: ${tempDir}`);
    } catch (error) {
      console.warn('[E2E Teardown] Cleanup failed:', error);
    }
  }
}

export default globalTeardown;
