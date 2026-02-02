# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the configuration GUI using [Playwright](https://playwright.dev/).

## Quick Start

```bash
# Install browsers (first time only)
npx playwright install --with-deps chromium

# Build the project
npm run build

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── fixtures/           # Test fixtures and setup
│   ├── server.ts       # Server readiness fixture
│   └── settings.json   # Mock settings data
├── utils/              # Shared test utilities
│   ├── selectors.ts    # Centralized element selectors
│   └── drag-drop.ts    # Drag & drop helper class
└── *.spec.ts           # Test suites (numbered by user journey)
```

### Test Suites

Tests are organized by user journey and numbered for clarity:

1. **01-initial-load.spec.ts** - Page load, data fetching, initial render
2. **02-drag-drop.spec.ts** - Widget drag & drop operations (most critical)
3. **03-widget-config.spec.ts** - Widget configuration panel
4. **04-row-operations.spec.ts** - Row management (add, delete, alignment, separator)
5. **05-preview-controls.spec.ts** - Terminal palette, theme, width controls
6. **06-context-simulation.spec.ts** - Claude context simulation
7. **07-settings-persistence.spec.ts** - Save, reset, dirty flag
8. **08-error-handling.spec.ts** - API failures, network errors, invalid operations

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ serverPage: page }) => {
    // Arrange
    const element = page.locator(SELECTORS.some.element);

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Using the Server Fixture

The `serverPage` fixture ensures the server is ready before tests run:

```typescript
test('my test', async ({ serverPage: page }) => {
  // Server is already running and page is loaded
  // API endpoints have responded
  // Preview is visible
});
```

### Using Selectors

Always use centralized selectors from `utils/selectors.ts`:

```typescript
// ✅ Good - centralized selector
const button = page.locator(SELECTORS.footer.saveButton);

// ❌ Bad - hardcoded selector
const button = page.locator('#save-settings');
```

### Using Drag & Drop Helper

For drag-drop operations, use the `DragDropHelper` class:

```typescript
import { DragDropHelper } from './utils/drag-drop.js';

test('should drag widget', async ({ serverPage: page }) => {
  const dragDrop = new DragDropHelper(page);

  // Drag from palette to row
  await dragDrop.dragFromPaletteToRow('directory', 0);

  // Verify widget was added
  const count = await dragDrop.getWidgetCountInRow(0);
  expect(count).toBeGreaterThan(0);
});
```

### Best Practices

1. **Wait for actions to complete**
   ```typescript
   await element.click();
   await page.waitForTimeout(300); // Allow animations to complete
   ```

2. **Use explicit waits**
   ```typescript
   await expect(element).toBeVisible({ timeout: 5000 });
   ```

3. **Verify state changes**
   ```typescript
   const before = await element.textContent();
   await button.click();
   const after = await element.textContent();
   expect(after).not.toBe(before);
   ```

4. **Clean up after tests**
   ```typescript
   test.beforeEach(async ({ serverPage: page }) => {
     // Reset to known state
   });
   ```

5. **Test user journeys, not implementation**
   ```typescript
   // ✅ Good - tests user behavior
   test('should save settings when clicking save button', ...);

   // ❌ Bad - tests implementation details
   test('should call POST /api/settings', ...);
   ```

## Debugging Failed Tests

### View trace on failure

Playwright automatically captures traces on first retry. View them:

```bash
npm run test:e2e:report
```

### Run in headed mode

See the browser while tests run:

```bash
npm run test:e2e:headed
```

### Use debug mode

Step through tests interactively:

```bash
npm run test:e2e:debug
```

### Check screenshots

Failed tests automatically capture screenshots in `test-results/`:

```
test-results/
└── my-test-chromium/
    ├── test-failed-1.png
    └── trace.zip
```

### Add debug statements

```typescript
// Log current state
console.log('Element text:', await element.textContent());

// Pause execution
await page.pause();

// Take manual screenshot
await page.screenshot({ path: 'debug.png' });
```

## CI/CD Integration

### GitHub Actions

E2E tests run automatically in CI via `.github/workflows/ci.yml`:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

### Artifacts

Failed test artifacts (screenshots, traces) are uploaded and available in GitHub Actions.

## Common Issues

### Server not starting

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:8765`

**Solution:**
```bash
# Ensure project is built
npm run build

# Check if port 8765 is already in use
netstat -ano | findstr :8765

# Kill process using the port (Windows)
taskkill /PID <PID> /F
```

### Tests timing out

**Error:** `Test timeout of 30000ms exceeded`

**Solution:**
- Increase timeout in test
- Check if server is responding
- Verify network conditions

```typescript
test('slow test', async ({ serverPage: page }) => {
  test.setTimeout(60000); // Increase to 60 seconds
  // ...
});
```

### Flaky tests

**Symptoms:** Tests pass/fail intermittently

**Solutions:**
1. Add proper waits
   ```typescript
   await page.waitForSelector(selector, { state: 'visible' });
   ```

2. Wait for network idle
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. Use built-in auto-waiting
   ```typescript
   await expect(element).toBeVisible(); // Waits automatically
   ```

### Selector not found

**Error:** `Error: locator.click: Target closed`

**Solution:**
1. Verify selector in `utils/selectors.ts` matches actual HTML
2. Check if element is dynamically loaded
3. Add wait before interaction

```typescript
const element = page.locator(selector);
await element.waitFor({ state: 'attached' });
await element.click();
```

## Performance Tips

### Run specific tests

```bash
# Run single file
npm run test:e2e -- 01-initial-load.spec.ts

# Run tests matching pattern
npm run test:e2e -- --grep "drag"
```

### Parallel execution

By default, tests run in parallel. Control parallelism:

```bash
# Run tests sequentially
npm run test:e2e -- --workers=1

# Run with 4 parallel workers
npm run test:e2e -- --workers=4
```

### Skip slow tests during development

```typescript
test.skip('slow test', async ({ serverPage: page }) => {
  // This test will be skipped
});
```

## Multi-Browser Testing

To test across multiple browsers, uncomment browser projects in `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },  // Uncomment
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },     // Uncomment
],
```

Run tests on specific browser:

```bash
npm run test:e2e:chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
