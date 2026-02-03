import { test, expect } from './fixtures/server.js';
import { SELECTORS } from './utils/selectors.js';

/**
 * Test Suite: Claude Context Simulation
 * Tests context simulation controls (radio buttons, not select)
 */
test.describe('Claude Context Simulation', () => {
  test('should toggle context types', async ({ serverPage: page }) => {
    // Test each context type (radio buttons)
    const contextTypes = ['none', 'file', 'selection', 'autocompact'];

    for (const type of contextTypes) {
      const radio = page.locator(SELECTORS.controls.contextTypeRadio(type));
      await radio.check();
      await page.waitForTimeout(300);

      // Verify selection changed
      const isChecked = await radio.isChecked();
      expect(isChecked).toBeTruthy();

      // Preview should update
      const preview = page.locator(SELECTORS.preview.allRows).first();
      const previewHTML = await preview.innerHTML();
      expect(previewHTML).toBeTruthy();
    }
  });

  test('should show file context in right section', async ({ serverPage: page }) => {
    const contextFileRadio = page.locator(SELECTORS.controls.contextTypeRadio('file'));
    const contextFileInput = page.locator(SELECTORS.controls.contextFile);
    const rightSection = page.locator(SELECTORS.preview.rightSection);

    // Set context type to "file"
    await contextFileRadio.check();
    await page.waitForTimeout(300);

    // File input should be visible
    await expect(contextFileInput).toBeVisible();

    // Update filename
    await contextFileInput.fill('example.ts');
    await contextFileInput.blur();
    await page.waitForTimeout(300);

    // Right section should show the filename
    const rightText = await rightSection.textContent();
    expect(rightText).toContain('example.ts');
  });

  test('should show line selection in right section', async ({ serverPage: page }) => {
    const contextSelectionRadio = page.locator(SELECTORS.controls.contextTypeRadio('selection'));
    const contextLinesInput = page.locator(SELECTORS.controls.contextLines);
    const rightSection = page.locator(SELECTORS.preview.rightSection);

    // Set context type to "selection"
    await contextSelectionRadio.check();
    await page.waitForTimeout(300);

    // Lines input should be visible
    await expect(contextLinesInput).toBeVisible();

    // Update line count
    await contextLinesInput.fill('42');
    await contextLinesInput.blur();
    await page.waitForTimeout(300);

    // Right section should show "N lines selected"
    const rightText = await rightSection.textContent();
    expect(rightText).toMatch(/42.*lines?/i);
  });

  test('should toggle plan mode indicator', async ({ serverPage: page }) => {
    const planModeCheckbox = page.locator(SELECTORS.controls.planMode);
    const footer = page.locator(SELECTORS.preview.footer);

    await expect(planModeCheckbox).toBeVisible();

    // Enable plan mode
    await planModeCheckbox.check();
    await page.waitForTimeout(300);

    // Footer should show plan mode indicator
    let footerText = await footer.textContent();
    expect(footerText).toMatch(/plan\s*mode/i);

    // Disable plan mode
    await planModeCheckbox.uncheck();
    await page.waitForTimeout(300);

    // Footer should not show plan mode indicator
    footerText = await footer.textContent();
    expect(footerText?.toLowerCase()).not.toContain('plan mode');
  });

  test('should show context inputs based on radio selection', async ({ serverPage: page }) => {
    const contextFileInput = page.locator(SELECTORS.controls.contextFile);
    const contextLinesInput = page.locator(SELECTORS.controls.contextLines);
    const contextAutocompactInput = page.locator(SELECTORS.controls.contextAutocompact);

    // File context - file input visible
    await page.locator(SELECTORS.controls.contextTypeRadio('file')).check();
    await page.waitForTimeout(200);
    await expect(contextFileInput).toBeVisible();

    // Selection context - lines input visible
    await page.locator(SELECTORS.controls.contextTypeRadio('selection')).check();
    await page.waitForTimeout(200);
    await expect(contextLinesInput).toBeVisible();

    // Autocompact context - autocompact input visible
    await page.locator(SELECTORS.controls.contextTypeRadio('autocompact')).check();
    await page.waitForTimeout(200);
    await expect(contextAutocompactInput).toBeVisible();

    // None - no context inputs (they might be hidden or just not used)
    await page.locator(SELECTORS.controls.contextTypeRadio('none')).check();
    await page.waitForTimeout(200);
    // Just verify page still works
    const preview = page.locator(SELECTORS.preview.container);
    await expect(preview).toBeVisible();
  });
});
