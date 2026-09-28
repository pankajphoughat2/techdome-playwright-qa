import { test, expect } from '../../utils/fixtures';

/** Beyond the brief: JS errors on load are often the first sign of a broken journey. */
test.describe('Console health @US-012', () => {
  for (const path of ['/', '/contact', '/newsletter', '/work', '/products/sparrow', '/careers']) {
    test(`${path} loads without console errors or uncaught exceptions`, async ({ page, consoleErrors }) => {
      await page.goto(path, { waitUntil: 'load' });
      // Trigger lazy/scroll-driven components before judging.
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(1500);
      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
    });
  }
});
