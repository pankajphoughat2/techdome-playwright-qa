import { test, expect } from '../../utils/fixtures';
import { knownBug } from '../../utils/helpers';

/**
 * Beyond the brief: network-level budgets and caching. These explain *why* pages feel
 * slow on mobile, which the LCP number alone doesn't.
 */
test.describe('Page weight, caching & slow networks @US-023', () => {
  test('homepage stays within a 3 MB transfer budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(2000);
    const w = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const sum = (f: (r: PerformanceResourceTiming) => boolean) => res.filter(f).reduce((a, r) => a + r.transferSize, 0);
      return {
        htmlTransfer: nav.transferSize,
        htmlDecoded: nav.decodedBodySize,
        js: sum((r) => r.initiatorType === 'script'),
        images: sum((r) => r.initiatorType === 'img' || /\/_next\/image/.test(r.name)),
        total: nav.transferSize + sum(() => true),
        requests: res.length + 1,
      };
    });
    await test.info().attach('page-weight.json', { body: JSON.stringify(w, null, 2), contentType: 'application/json' });
    test.info().annotations.push({ type: 'page-weight', description: `total ${(w.total / 1e6).toFixed(2)} MB · images ${(w.images / 1e6).toFixed(2)} MB · JS ${(w.js / 1e3).toFixed(0)} KB · HTML ${(w.htmlDecoded / 1e3).toFixed(0)} KB decoded` });
    // Hard gate on total only. The JS figure is recorded, not gated: any JS budget
    // would be a number we invented, and that's a team decision, not a defect.
    expect(w.total, 'total bytes transferred').toBeLessThan(3_000_000);
  });

  test('hashed static assets are cached immutably for a year', async ({ page, request }) => {
    await page.goto('/', { waitUntil: 'load' });
    const chunk = await page.evaluate(() => (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).find((r) => r.name.includes('/_next/static/'))?.name);
    expect(chunk).toBeTruthy();
    const cc = (await request.get(chunk!)).headers()['cache-control'];
    expect(cc).toMatch(/max-age=31536000/);
    expect(cc).toMatch(/immutable/);
  });

  test('optimised images are cached for at least a day', async ({ page, request }) => {
    knownBug('BUG-012', '/_next/image responses use max-age=60, must-revalidate');
    await page.goto('/', { waitUntil: 'load' });
    const img = await page.evaluate(() => (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).find((r) => r.name.includes('/_next/image'))?.name);
    expect(img, 'a /_next/image request on the homepage').toBeTruthy();
    const cc = (await request.get(img!)).headers()['cache-control'] ?? '';
    const maxAge = Number(/max-age=(\d+)/.exec(cc)?.[1] ?? 0);
    expect(maxAge, `cache-control: ${cc}`).toBeGreaterThanOrEqual(86_400);
  });

  test('hero is readable within 10 s on a throttled "Fast 3G" connection', async ({ page }) => {
    test.setTimeout(90_000);
    // Chromium DevTools "Fast 3G" preset: 1.44 Mbps down, 675 Kbps up, 562 ms RTT.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 562, downloadThroughput: (1.44 * 1024 * 1024) / 8, uploadThroughput: (675 * 1024) / 8,
    });
    const t0 = Date.now();
    await page.goto('/', { waitUntil: 'commit', timeout: 60_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    const heroMs = Date.now() - t0;
    await expect(page.getByRole('main').getByRole('link', { name: /Book a product teardown/ })).toBeVisible({ timeout: 30_000 });
    const ctaMs = Date.now() - t0;
    test.info().annotations.push({ type: 'fast-3g', description: `h1 visible ${heroMs} ms · CTA visible ${ctaMs} ms` });
    expect(heroMs, 'time to visible h1 on Fast 3G').toBeLessThan(10_000);
  });

  test('offline visitors get the browser error, not a half-rendered broken page', async ({ page, context }) => {
    // After a first load, going offline and navigating must fail cleanly (no service worker
    // serving stale or broken shells).
    await page.goto('/', { waitUntil: 'load' });
    await context.setOffline(true);
    const err = await page.goto('/work').then(() => null, (e: Error) => e.message);
    await context.setOffline(false);
    expect(err).toMatch(/ERR_INTERNET_DISCONNECTED|net::/);
  });
});
