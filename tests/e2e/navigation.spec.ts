import { test, expect } from '../../utils/fixtures';
import { CORE_PAGES, knownBug, mapWithConcurrency, statusOf } from '../../utils/helpers';
import { BasePage } from '../../pages/BasePage';

test.describe('Navigation & page load @US-002', () => {
  for (const { path, titleIncludes } of CORE_PAGES) {
    test(`${path} returns 200 with a real title and content`, async ({ page }) => {
      const base = new BasePage(page);
      const response = await base.goto(path);
      expect(response?.status(), `${path} HTTP status`).toBe(200);
      await expect(page).toHaveTitle(titleIncludes);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      // "Not a blank page": meaningful rendered text inside <main>.
      const text = await page.getByRole('main').innerText();
      expect(text.trim().length, `${path} main content length`).toBeGreaterThan(200);
    });
  }

  test('every internal link in header and footer resolves (no 4xx/5xx)', async ({ page, request }) => {
    const base = new BasePage(page);
    await base.goto('/');
    const hrefs = await page.locator('header a[href^="/"], footer a[href^="/"]').evaluateAll((as) =>
      Array.from(new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!.split('#')[0]))),
    );
    expect(hrefs.length).toBeGreaterThan(15);

    const results = await mapWithConcurrency(hrefs, 3, async (href) => ({ href, status: await statusOf(request, href) }));
    const broken = results.filter((r) => r.status >= 400);
    expect(broken, `Broken internal links: ${JSON.stringify(broken)}`).toEqual([]);
  });

  test('desktop "What we do" menu opens and routes to Staff Augmentation', async ({ page }) => {
    const base = new BasePage(page);
    await base.goto('/');
    const trigger = base.navMenuButton('What we do');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Scoped to <header>: an unscoped locator once matched the footer link instead.
    await base.header.getByRole('link', { name: 'Staff Augmentation' }).click();
    await expect(page).toHaveURL(/\/staff-augmentation$/);
    await expect(page).toHaveTitle(/Staff Augmentation/);
  });

  test('"Services Overview" is reachable from the header menu', async ({ page }) => {
    knownBug('BUG-008', '/services is linked only from the footer, not from any header menu');
    const base = new BasePage(page);
    await base.goto('/');
    await base.navMenuButton('What we do').click();
    await expect(base.header.getByRole('link', { name: /Services/ })).toBeVisible({ timeout: 3000 });
  });

  test('trailing-slash URLs permanently redirect to the canonical path', async ({ request }) => {
    for (const [from, to] of [['/contact/', '/contact'], ['/products/sparrow/', '/products/sparrow']]) {
      const res = await request.get(from, { maxRedirects: 0, failOnStatusCode: false });
      expect([301, 308], from).toContain(res.status());
      expect(res.headers()['location']).toBe(to);
    }
  });

  test('campaign query strings do not break pages (ad / newsletter links)', async ({ page }) => {
    const res = await page.goto('/?utm_source=newsletter&utm_medium=email&utm_campaign=qa&fbclid=abc123');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your product team/);
    // Canonical must drop the tracking params, or every campaign URL becomes a duplicate page.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/techdome\.io\/?$/);
  });

  test('browser Back and Forward restore the right pages', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.seeWorkCta.click();
    await expect(page).toHaveURL(/\/work$/);
    await page.goBack();
    await expect(page).toHaveURL(/techdome\.io\/?$/);
    await expect(homePage.heroHeading).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page).toHaveTitle(/Case Studies/);
  });

  test('keyboard focus is visible on the first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const style = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth), shadow: cs.boxShadow };
    });
    expect(style.tag).not.toBe('BODY');
    expect(style.outline !== 'none' && style.width > 0 || style.shadow !== 'none', JSON.stringify(style)).toBe(true);
  });

  test('a "skip to content" link is the first Tab stop', async ({ page }) => {
    knownBug('BUG-013', 'No skip link — keyboard users tab through the whole header on every page');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText(/skip/i);
    await expect(focused).toHaveAttribute('href', /^#/);
  });

  test('logo returns the user to the homepage from a deep page', async ({ page }) => {
    const base = new BasePage(page);
    await base.goto('/products/sparrow');
    await base.homeLink.click();
    await expect(page).toHaveURL(/techdome\.io\/?$/);
  });

  test('unknown URL returns a real 404 with a way back', async ({ page }) => {
    const base = new BasePage(page);
    const response = await base.goto('/this-page-does-not-exist-qa');
    expect(response?.status()).toBe(404);
    await expect(base.homeLink).toBeVisible();
  });

  test('404 page has its own title (not the homepage title)', async ({ page }) => {
    knownBug('BUG-005', '404 page reuses the homepage <title>');
    const base = new BasePage(page);
    await base.goto('/this-page-does-not-exist-qa');
    await expect(page).not.toHaveTitle('Techdome — Custom Software Development Company & Venture Studio');
    await expect(page).toHaveTitle(/not found|404/i);
  });

  test('product page titles are not truncated with a literal ellipsis', async ({ page }) => {
    knownBug('BUG-004', 'Product <title>s are hard-truncated with "..." mid-phrase');
    const base = new BasePage(page);
    const truncated: string[] = [];
    for (const path of ['/products/sparrow', '/products/justinterview-ai', '/products/saral-funding', '/products/geolytics']) {
      await base.goto(path);
      const title = await page.title();
      if (title.includes('...')) truncated.push(`${path}: "${title}"`);
    }
    expect(truncated, truncated.join('\n')).toEqual([]);
  });
});
