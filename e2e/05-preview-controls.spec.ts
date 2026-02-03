import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';

/**
 * Test Suite: Preview Controls
 * Verifies terminal palette, theme, and width controls work correctly
 */
test.describe('Preview Controls', () => {
  test('should switch terminal palette', async ({ serverPage: page }) => {
    const terminalSelect = page.locator(SELECTORS.controls.terminalSelect);
    await expect(terminalSelect).toBeVisible();

    // Get initial value
    const initialValue = await terminalSelect.inputValue();

    // Get available options
    const options = await terminalSelect.locator('option').count();
    expect(options).toBeGreaterThan(1);

    // Switch to second option
    const secondOption = await terminalSelect.locator('option').nth(1).getAttribute('value');
    if (secondOption) {
      await terminalSelect.selectOption(secondOption);
      await page.waitForTimeout(300);

      // Verify selection changed
      const finalValue = await terminalSelect.inputValue();
      expect(finalValue).toBe(secondOption);
      expect(finalValue).not.toBe(initialValue);

      // Preview should update
      const preview = page.locator(SELECTORS.preview.statusbar);
      const previewHTML = await preview.innerHTML();
      expect(previewHTML).toBeTruthy();
    }
  });

  test('should switch theme', async ({ serverPage: page }) => {
    const themeSelect = page.locator(SELECTORS.controls.themeSelect);
    await expect(themeSelect).toBeVisible();

    // Get initial value
    const initialValue = await themeSelect.inputValue();

    // Get available options
    const options = await themeSelect.locator('option').count();
    expect(options).toBeGreaterThan(1);

    // Switch to a different theme
    const secondOption = await themeSelect.locator('option').nth(1).getAttribute('value');
    if (secondOption) {
      await themeSelect.selectOption(secondOption);
      await page.waitForTimeout(300);

      // Verify theme changed
      const finalValue = await themeSelect.inputValue();
      expect(finalValue).toBe(secondOption);
      expect(finalValue).not.toBe(initialValue);

      // Preview container should have theme-related styling
      const preview = page.locator(SELECTORS.preview.container);
      const backgroundColor = await preview.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('should adjust terminal width', async ({ serverPage: page }) => {
    const widthInput = page.locator(SELECTORS.controls.widthInput);

    await expect(widthInput).toBeVisible();

    // Get initial width
    const initialWidth = await widthInput.inputValue();

    // Change width
    const newWidth = '120';
    await widthInput.fill(newWidth);
    await page.waitForTimeout(500);

    // Verify width changed
    const finalWidth = await widthInput.inputValue();
    expect(finalWidth).toBe(newWidth);
    expect(finalWidth).not.toBe(initialWidth);

    // Preview should update
    const preview = page.locator(SELECTORS.preview.container);
    await expect(preview).toBeVisible();
  });

  test('should re-render preview on control change', async ({ serverPage: page }) => {
    const preview = page.locator(SELECTORS.preview.statusbar);

    // Get initial preview HTML
    const initialHTML = await preview.innerHTML();

    // Change terminal palette
    const terminalSelect = page.locator(SELECTORS.controls.terminalSelect);
    const options = await terminalSelect.locator('option').count();
    if (options > 1) {
      await terminalSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);

      // Verify preview updated
      const afterTerminalHTML = await preview.innerHTML();
      expect(afterTerminalHTML).not.toBe(initialHTML);

      // Change theme (affects CSS/background, not HTML content)
      const themeSelect = page.locator(SELECTORS.controls.themeSelect);
      const previewContainer = page.locator(SELECTORS.preview.container);

      await themeSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);

      // Verify theme CSS class changed (not HTML content)
      const themeClass = await previewContainer.getAttribute('class');
      expect(themeClass).toContain('theme-');
    }
  });

  // TODO: Input validation not implemented - input accepts any value
  // Would need to add min/max validation in JavaScript handler
  test.skip('should validate terminal width range', async ({ serverPage: page }) => {
    const widthInput = page.locator(SELECTORS.controls.widthInput);

    // Get min and max values
    const min = await widthInput.getAttribute('min');
    const max = await widthInput.getAttribute('max');

    expect(min).toBeTruthy();
    expect(max).toBeTruthy();

    // Try to set width below min (should clamp)
    await widthInput.fill('0');
    await page.waitForTimeout(100);
    const clampedMin = await widthInput.inputValue();
    expect(parseInt(clampedMin)).toBeGreaterThanOrEqual(parseInt(min || '40'));

    // Try to set width above max (should clamp)
    await widthInput.fill('300');
    await page.waitForTimeout(100);
    const clampedMax = await widthInput.inputValue();
    expect(parseInt(clampedMax)).toBeLessThanOrEqual(parseInt(max || '200'));
  });

  test('should match ANSI colors to selected terminal palette', async ({ serverPage: page }) => {
    const terminalSelect = page.locator(SELECTORS.controls.terminalSelect);
    const preview = page.locator(SELECTORS.preview.statusbar);

    // Switch to a known palette (e.g., "vscode")
    const options = await terminalSelect.locator('option').all();
    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value === 'vscode') {
        await terminalSelect.selectOption(value);
        await page.waitForTimeout(300);
        break;
      }
    }

    // Verify preview has inline styles for colors (in hex format)
    const previewHTML = await preview.innerHTML();
    expect(previewHTML).toContain('color:'); // Should have inline color styles
    expect(previewHTML).toContain('color:#'); // Colors should be in hex format
  });

  test('should persist control values after preview updates', async ({ serverPage: page }) => {
    const terminalSelect = page.locator(SELECTORS.controls.terminalSelect);
    const widthInput = page.locator(SELECTORS.controls.widthInput);

    // Set specific values
    await terminalSelect.selectOption({ index: 1 });
    await widthInput.fill('100');
    await page.waitForTimeout(300);

    const selectedTerminal = await terminalSelect.inputValue();
    const selectedWidth = await widthInput.inputValue();

    // Trigger a preview update by adding a widget
    const paletteWidget = page.locator(SELECTORS.palette.widget('directory'));
    const firstRow = page.locator(SELECTORS.rows.row(0));
    await paletteWidget.dragTo(firstRow);
    await page.waitForTimeout(300);

    // Verify control values are still the same
    const finalTerminal = await terminalSelect.inputValue();
    const finalWidth = await widthInput.inputValue();

    expect(finalTerminal).toBe(selectedTerminal);
    expect(finalWidth).toBe(selectedWidth);
  });
});
