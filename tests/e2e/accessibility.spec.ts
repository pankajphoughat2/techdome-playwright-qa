import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from '../../utils/fixtures';
import { knownBug } from '../../utils/helpers';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PAGES = ['/', '/contact', '/newsletter', '/services', '/careers', '/products/sparrow'];

/** Load a page and render everything axe should see. Much of the content fades in on scroll. */
async function scan(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500); // let entrance animations settle; avoids mid-fade false hits
  return (await new AxeBuilder({ page }).withTags(WCAG_AA).analyze()).violations;
}

/**
 * Automated WCAG 2.1/2.2 AA scan with axe-core.
 *
 *  - Per page: no critical/serious violations other than colour contrast. This is a HARD
 *    gate, so any new class of a11y regression fails immediately.
 *  - Contrast: one aggregated test across all pages, tracked as BUG-011. It's a site-wide
 *    design-token problem, and per-page assertions flipped between runs depending on how
 *    much animated content had rendered, which made them flaky rather than informative.
 *
 * axe catches roughly 30-40% of WCAG issues; the manual checks (focus trap, skip link,
 * labels) live in chat-widget / navigation / newsletter specs.
 */
test.describe('Accessibility (axe-core, WCAG 2.1 AA) @US-022', () => {
  for (const path of PAGES) {
    test(`${path}: no critical or serious WCAG violations (excluding contrast)`, async ({ page }) => {
      const violations = await scan(page, path);
      await test.info().attach(`axe${path.replace(/\//g, '_') || '_home'}.json`, {
        body: JSON.stringify(violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => ({ target: n.target, summary: n.failureSummary })) })), null, 2),
        contentType: 'application/json',
      });
      const blocking = violations.filter((v) => v.id !== 'color-contrast' && (v.impact === 'critical' || v.impact === 'serious'));
      expect(blocking.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes)`)).toEqual([]);
    });
  }

  test('text meets WCAG AA colour contrast (4.5:1) across the site', async ({ page }) => {
    knownBug('BUG-011', 'Slate-400 (#94a3b8) text on white is 2.56:1, site-wide');
    test.setTimeout(180_000);
    const perPage: Record<string, number> = {};
    let sample = '';
    for (const path of PAGES) {
      const contrast = (await scan(page, path)).find((v) => v.id === 'color-contrast');
      perPage[path] = contrast?.nodes.length ?? 0;
      sample ||= contrast?.nodes[0]?.failureSummary ?? '';
    }
    await test.info().attach('contrast-by-page.json', { body: JSON.stringify(perPage, null, 2), contentType: 'application/json' });
    test.info().annotations.push({ type: 'contrast', description: JSON.stringify(perPage) });
    const total = Object.values(perPage).reduce((a, b) => a + b, 0);
    expect(total, `${JSON.stringify(perPage)}\n${sample}`).toBe(0);
  });
});
