import * as path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../utils/fixtures';
import { findHorizontalOverflow, waitForStableLayout } from '../utils/helpers';
import { SUBSCRIBE_ENDPOINT } from '../pages/NewsletterPage';

/**
 * Regenerates the screenshots embedded in docs/bugs.md:  npm run evidence
 * Not part of the default run (the `evidence` project only exists when EVIDENCE=1).
 * Anything drawn on top of the page (red outlines, captions) is labelled "QA annotation"
 * so nobody mistakes it for the site's own UI.
 */
const OUT = path.join(__dirname, '..', 'docs', 'evidence');
const shot = (name: string) => path.join(OUT, name);

async function annotate(page: import('@playwright/test').Page, caption: string, selectors: string[] = []) {
  await page.evaluate(({ caption, selectors }) => {
    for (const sel of selectors) document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      el.style.outline = '3px solid #e11d48';
      el.style.outlineOffset = '-3px';
    });
    const box = document.createElement('div');
    box.textContent = `QA annotation: ${caption}`;
    Object.assign(box.style, { position: 'fixed', left: '8px', bottom: '8px', right: '8px', zIndex: '2147483647', background: '#e11d48', color: '#fff', font: '600 13px/1.4 system-ui, sans-serif', padding: '8px 10px', borderRadius: '6px' });
    document.body.appendChild(box);
  }, { caption, selectors });
}

test.describe('Bug evidence', () => {
  test('BUG-001: homepage overflow + clipped hamburger at 375px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto('/');
    await waitForStableLayout(page);
    const r = await findHorizontalOverflow(page);
    expect(r.scrollWidth).toBeGreaterThan(r.viewport); // still reproduces?
    await annotate(page, `document is ${r.scrollWidth}px wide in a ${r.viewport}px viewport. Hamburger (outlined) is cut off at the right edge.`, ['button[aria-label="Open navigation"]']);
    await page.screenshot({ path: shot('bug-001-overflow-375.png'), clip: { x: 0, y: 0, width: 375, height: 260 } });
    await ctx.close();
  });

  test('BUG-003: newsletter input has no label', async ({ newsletterPage, page }) => {
    await newsletterPage.open();
    await newsletterPage.form.scrollIntoViewIfNeeded();
    await annotate(page, 'This input has no <label>, aria-label or autocomplete. Its accessible name comes from the placeholder only.', ['main form input[type="email"]']);
    await newsletterPage.form.screenshot({ path: shot('bug-003-newsletter-no-label.png') });
  });

  test('BUG-005: 404 page shows the homepage title', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-qa');
    const title = await page.title();
    await annotate(page, `HTTP 404, but document.title = "${title}"`);
    await page.screenshot({ path: shot('bug-005-404-title.png') });
  });

  test('BUG-009: server outage is reported as the visitor\'s network error', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (r) => r.fulfill({ status: 500, contentType: 'text/html', body: '<html>502 Bad Gateway</html>' }));
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');
    await expect(newsletterPage.statusMessage(/Network error/)).toBeVisible();
    await annotate(page, 'Server returned 500 (mocked). The UI tells the visitor to check THEIR connection.');
    await newsletterPage.form.screenshot({ path: shot('bug-009-misleading-network-error.png') });
  });

  test('BUG-010: chat focus lost after Escape', async ({ homePage, chat, page }) => {
    await homePage.open();
    await chat.open();
    await page.keyboard.press('Escape');
    await expect(chat.dialog).toBeHidden(); // wait out the exit animation
    await page.waitForTimeout(500);
    const active = await page.evaluate(() => { const el = document.activeElement as HTMLElement | null; return `<${el?.tagName.toLowerCase()}${el?.getAttribute('aria-label') ? ` aria-label="${el.getAttribute('aria-label')}"` : ''}>${el && el !== document.body && !el.checkVisibility() ? ' (not visible)' : ''}`; });
    await annotate(page, `Dialog closed with Escape. Focus is now on ${active}. It should return to the outlined launcher.`, ['button[aria-label="Open Pod chat"]']);
    await page.screenshot({ path: shot('bug-010-chat-focus-lost.png') });
  });

  test('BUG-011: low-contrast text flagged by axe', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    // Same render-everything-first approach as tests/e2e/accessibility.spec.ts.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const res = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    const targets = res.violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')));
    expect(targets.length).toBeGreaterThan(0);
    const first = targets[0];
    await page.locator(first).first().scrollIntoViewIfNeeded();
    await annotate(page, `${targets.length} elements fail WCAG AA contrast (outlined). #94a3b8 on #ffffff = 2.56:1, needs 4.5:1.`, targets);
    await page.screenshot({ path: shot('bug-011-contrast.png') });
  });
});
