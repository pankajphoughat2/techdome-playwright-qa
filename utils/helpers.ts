import { test, type Page, type APIRequestContext } from '@playwright/test';

/** Hard ceiling from the assignment. Never raise this. */
export const MAX_CONCURRENT_USERS = 5;

/** Hosts that are pure analytics/tracking. Blocked by default so the suite does not pollute Techdome's analytics. */
export const ANALYTICS_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'doubleclick.net',
  'clarity.ms',
  'connect.facebook.net',
  'snap.licdn.com',
  'hotjar.com',
];

export const isAnalyticsUrl = (url: string) => {
  const host = new URL(url).hostname;
  return ANALYTICS_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
};

/** Top-level pages reachable from the header/footer. Kept explicit so a removed page shows up as a failure, not a silently shorter list. */
export const CORE_PAGES: { path: string; titleIncludes: RegExp }[] = [
  { path: '/', titleIncludes: /Custom Software Development Company & Venture Studio/ },
  { path: '/services', titleIncludes: /Engineering Services \| Techdome/ },
  { path: '/studio', titleIncludes: /Product Venture Studio \| Techdome/ },
  { path: '/staff-augmentation', titleIncludes: /Staff Augmentation/ },
  { path: '/automation', titleIncludes: /n8n Automation/ },
  { path: '/work', titleIncludes: /Case Studies/ },
  { path: '/products', titleIncludes: /Proprietary Software Products/ },
  { path: '/products/sparrow', titleIncludes: /^Sparrow/ },
  { path: '/products/justinterview-ai', titleIncludes: /^JustInterview\.ai/ },
  { path: '/products/saral-funding', titleIncludes: /^Saral Funding/ },
  { path: '/products/geolytics', titleIncludes: /^Geolytics/ },
  { path: '/products/aether-voice', titleIncludes: /Aether Voice/ },
  { path: '/products/catalyst', titleIncludes: /^Catalyst/ },
  { path: '/products/arc', titleIncludes: /ARC/ },
  { path: '/about', titleIncludes: /^About Us/ },
  { path: '/insights', titleIncludes: /Engineering Insights/ },
  { path: '/newsletter', titleIncludes: /Newsletter/ },
  { path: '/life-at-techdome', titleIncludes: /^Life at Techdome/ },
  { path: '/careers', titleIncludes: /^Careers/ },
  { path: '/faq', titleIncludes: /Frequently Asked Questions/ },
  { path: '/contact', titleIncludes: /Talk to an Architect/ },
  { path: '/privacy', titleIncludes: /Privacy Policy/ },
  { path: '/terms', titleIncludes: /Terms of Use/ },
];

/**
 * Marks a test as an expected failure caused by a documented bug.
 * The test still runs; if the bug gets fixed, Playwright reports it as
 * "expected to fail but passed", prompting us to remove the annotation.
 *
 * Set STRICT=1 to disable this and see every known bug as a plain red failure.
 */
export function knownBug(bugId: string, reason: string) {
  test.info().annotations.push({ type: 'known-bug', description: `${bugId}: ${reason}` });
  if (!process.env.STRICT) test.fail(true, `${bugId} — see docs/bugs.md`);
}

/** Waits until fonts/images are settled enough for layout measurements. */
export async function waitForStableLayout(page: Page) {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts?.ready);
}

/** Returns elements that stick out past the right edge of the viewport (ignores fixed-position overlays). */
export async function findHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: { selector: string; right: number; text: string }[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= vw + 1) continue;
      // Only report leaf-most offenders; parents are implied.
      if (Array.from(el.children).some((c) => c.getBoundingClientRect().right > vw + 1)) continue;
      // Skip content inside an intentional horizontal scroller.
      let p = el.parentElement;
      let inScroller = false;
      while (p) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') { inScroller = true; break; }
        p = p.parentElement;
      }
      if (inScroller) continue;
      const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join('.') : '';
      offenders.push({ selector: `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`, right: Math.round(r.right), text: (el.innerText || '').slice(0, 40) });
    }
    return { viewport: vw, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 10) };
  });
}

/** Runs async tasks with a bounded concurrency. Used to stay polite when checking many URLs. */
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  if (limit > MAX_CONCURRENT_USERS) throw new Error(`Concurrency ${limit} exceeds hard cap ${MAX_CONCURRENT_USERS}`);
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Fetches a URL and returns only the status, following redirects. */
export async function statusOf(request: APIRequestContext, url: string) {
  const res = await request.get(url, { maxRedirects: 5, failOnStatusCode: false, timeout: 20_000 });
  return res.status();
}

/** Nearest-rank percentile. */
export function percentile(values: number[], p: number) {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
}
