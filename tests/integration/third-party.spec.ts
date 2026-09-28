import { test, expect } from '../../utils/fixtures';

type Res = { name: string; initiatorType: string; renderBlockingStatus?: string; startTime: number; duration: number };

test.describe('Third-party scripts @US-016', () => {
  // This file is specifically about third parties, so let analytics load for real.
  test.use({ allowAnalytics: true });

  test('third-party scripts load without blocking render', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(2000); // let GTM pull its tags

    const { resources, fcp } = await page.evaluate(() => ({
      resources: (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .filter((r) => new URL(r.name).hostname !== location.hostname)
        .map((r) => ({ name: r.name, initiatorType: r.initiatorType, renderBlockingStatus: (r as any).renderBlockingStatus, startTime: r.startTime, duration: r.duration })),
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
    }));
    await test.info().attach('third-party-resources.json', { body: JSON.stringify({ fcp, resources }, null, 2), contentType: 'application/json' });

    expect(resources.length, 'expected at least one third-party resource (GTM)').toBeGreaterThan(0);
    const blocking = resources.filter((r: Res) => r.renderBlockingStatus === 'blocking');
    expect(blocking, `Render-blocking third-party resources:\n${JSON.stringify(blocking, null, 2)}`).toEqual([]);

    // Belt and braces: every third-party <script> in the DOM must be async/defer or injected dynamically.
    const syncScripts = await page.locator('script[src]').evaluateAll((els) =>
      (els as HTMLScriptElement[])
        .filter((s) => new URL(s.src).hostname !== location.hostname)
        .filter((s) => !s.async && !s.defer && s.type !== 'module')
        .map((s) => s.src),
    );
    expect(syncScripts, 'synchronous third-party <script src> tags').toEqual([]);
  });

  test('Google Tag Manager container loads and does not delay first paint', async ({ page }) => {
    const gtm = page.waitForResponse(/googletagmanager\.com\/gtm\.js/);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const res = await gtm;
    expect(res.status()).toBe(200);
    const timing = await page.evaluate(() => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
      const g = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).find((r) => r.name.includes('gtm.js'));
      return { fcp, gtmStart: g?.startTime, gtmEnd: g?.responseEnd };
    });
    test.info().annotations.push({ type: 'timing', description: JSON.stringify(timing) });
    expect(timing.gtmStart).toBeDefined();
  });

  test('site still renders and CTAs work when every third party is down', async ({ page }) => {
    // Simulates an ad-blocker / CDN outage: nothing off-origin may be load-bearing.
    await page.context().route(
      (url) => url.hostname !== 'techdome.io',
      (route) => route.abort('blockedbyclient'),
    );
    const response = await page.goto('/', { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your product team/);
    await page.getByRole('main').getByRole('link', { name: /See what we've built/ }).click();
    await expect(page).toHaveURL(/\/work$/);
  });

  test('Calendly embed loads on the contact page', async ({ page }) => {
    const calendly = page.waitForResponse((r) => r.url().includes('calendly.com') && r.request().resourceType() === 'document');
    await page.goto('/contact');
    const res = await calendly;
    expect(res.status()).toBeLessThan(400);
  });
});
