import { test, expect } from '../../utils/fixtures';
import { mapWithConcurrency, statusOf } from '../../utils/helpers';

test.describe('Primary CTAs & external links @US-006 @US-007', () => {
  test('"Book a product teardown" routes to the contact page', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.bookTeardownCta.click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Talk to an architect/i);
  });

  test('"See what we\'ve built" routes to the portfolio', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.seeWorkCta.click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page).toHaveTitle(/Case Studies/);
  });

  test('header "Contact Us" routes to the contact page', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.headerContactLink.click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test('every product "Explore" CTA on the homepage opens its product page', async ({ homePage, page, request }) => {
    await homePage.open();
    // "Explore" is also used for non-product links (e.g. /insights), so scope by destination.
    const explore = page.getByRole('main').getByRole('link', { name: /^Explore / }).and(page.locator('a[href^="/products/"]'));
    const hrefs = await explore.evaluateAll((as) => Array.from(new Set(as.map((a) => a.getAttribute('href')!))));
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    const statuses = await mapWithConcurrency(hrefs, 3, (h) => statusOf(request, h));
    expect(statuses.every((s) => s === 200), JSON.stringify(Object.fromEntries(hrefs.map((h, i) => [h, statuses[i]])))).toBe(true);
  });

  test('external links to Techdome-owned products are live', async ({ homePage, page, request }) => {
    // Only Techdome's own properties are status-checked. Social networks / Upwork
    // return 403/999 to bots, so asserting their status would test their bot
    // protection, not Techdome — those get structural checks in footer.spec.ts.
    await homePage.open();
    const hrefs = await page.getByRole('main').getByRole('link', { name: /Visit live|Read docs/ })
      .evaluateAll((as) => Array.from(new Set(as.map((a) => (a as HTMLAnchorElement).href))));
    expect(hrefs.length).toBeGreaterThanOrEqual(2);
    const results = await mapWithConcurrency(hrefs, 3, async (href) => ({ href, status: await statusOf(request, href) }));
    const broken = results.filter((r) => r.status >= 400);
    expect(broken, JSON.stringify(broken)).toEqual([]);
  });

  test('external links open safely in a new tab', async ({ homePage, page }) => {
    await homePage.open();
    const external = await page.locator('main a[href^="http"]').evaluateAll((as) =>
      (as as HTMLAnchorElement[])
        .filter((a) => new URL(a.href).hostname !== location.hostname)
        .map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
    );
    expect(external.length).toBeGreaterThan(0);
    const unsafe = external.filter((l) => l.target !== '_blank' || !/noopener|noreferrer/.test(l.rel));
    expect(unsafe, `External links without target=_blank + rel=noopener: ${JSON.stringify(unsafe, null, 2)}`).toEqual([]);
  });
});
