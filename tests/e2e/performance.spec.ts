import { test, expect } from '../../utils/fixtures';

type Vitals = { lcp: number | null; lcpElement: string | null; cls: number; ttfb: number; domContentLoaded: number };

async function collectVitals(page: import('@playwright/test').Page): Promise<Vitals> {
  return page.evaluate(
    () =>
      new Promise<Vitals>((resolve) => {
        let lcp: number | null = null;
        let lcpElement: string | null = null;
        let cls = 0;
        new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
          lcp = last.startTime;
          lcpElement = last.element ? `${last.element.tagName.toLowerCase()} ${(last.element.textContent || '').trim().slice(0, 40)}` : null;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!e.hadRecentInput) cls += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        // Give late LCP candidates (hero image / web font swap) a moment to land.
        setTimeout(() => resolve({ lcp, lcpElement, cls, ttfb: nav.responseStart, domContentLoaded: nav.domContentLoadedEventEnd }), 3000);
      }),
  );
}

test.describe('Page-level performance @US-011', () => {
  for (const path of ['/', '/contact', '/work']) {
    test(`${path} records Largest Contentful Paint`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      const vitals = await collectVitals(page);
      await test.info().attach(`vitals${path.replace(/\//g, '_') || '_home'}.json`, {
        body: JSON.stringify(vitals, null, 2), contentType: 'application/json',
      });
      test.info().annotations.push({ type: 'LCP', description: `${path}: ${Math.round(vitals.lcp ?? -1)}ms (${vitals.lcpElement}) · CLS ${vitals.cls.toFixed(3)} · TTFB ${Math.round(vitals.ttfb)}ms` });

      expect(vitals.lcp, 'LCP was recorded').not.toBeNull();
      // Lab numbers from a test runner's network are noisy, so we gate only on Google's
      // "poor" boundary (4.0s LCP / 0.25 CLS). Missing the "good" bar (2.5s / 0.1) is
      // recorded as an annotation for the bug report rather than failing the suite.
      if (vitals.lcp! >= 2500 || vitals.cls >= 0.1) {
        test.info().annotations.push({ type: 'needs-improvement', description: `${path} misses Core Web Vitals "good" thresholds` });
      }
      expect(vitals.lcp!, 'LCP (ms) must not be in the "poor" band').toBeLessThan(4000);
      expect(vitals.cls, 'CLS must not be in the "poor" band').toBeLessThan(0.25);
    });
  }
});
