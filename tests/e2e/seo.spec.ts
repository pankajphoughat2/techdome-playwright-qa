import { test, expect } from '../../utils/fixtures';
import { CORE_PAGES, knownBug } from '../../utils/helpers';

type PageMeta = { path: string; title: string; description: string; canonical: string | null; ogUrl: string | null; h1: number; lang: string | null };

/**
 * Beyond the brief: for a lead-gen site, organic search IS the top of the funnel.
 * One crawl of all 23 core pages, then assertions over the whole set, which is what
 * catches site-wide problems like duplicate titles/descriptions.
 */
test.describe('SEO hygiene across all core pages @US-021', () => {
  test.describe.configure({ mode: 'serial' });
  let pages: PageMeta[] = [];

  test('crawl: every page has a canonical, og:url, lang and exactly one h1', async ({ page, baseURL }) => {
    test.setTimeout(180_000);
    pages = [];
    for (const { path } of CORE_PAGES) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      pages.push(await page.evaluate((path) => ({
        path,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? null,
        h1: document.querySelectorAll('h1').length,
        lang: document.documentElement.getAttribute('lang'),
      }), path));
    }
    await test.info().attach('seo-crawl.json', { body: JSON.stringify(pages, null, 2), contentType: 'application/json' });

    const problems: string[] = [];
    for (const p of pages) {
      const expected = new URL(p.path, baseURL).href.replace(/\/$/, '');
      if (p.canonical?.replace(/\/$/, '') !== expected) problems.push(`${p.path}: canonical=${p.canonical}`);
      if (p.ogUrl?.replace(/\/$/, '') !== expected) problems.push(`${p.path}: og:url=${p.ogUrl}`);
      if (p.h1 !== 1) problems.push(`${p.path}: ${p.h1} <h1> elements`);
      if (p.lang !== 'en') problems.push(`${p.path}: lang=${p.lang}`);
      if (!p.description) problems.push(`${p.path}: missing meta description`);
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('titles and meta descriptions are unique across pages', async () => {
    test.skip(pages.length === 0, 'crawl did not run');
    const dupes = (key: 'title' | 'description') => {
      const seen = new Map<string, string[]>();
      for (const p of pages) seen.set(p[key], [...(seen.get(p[key]) ?? []), p.path]);
      return [...seen.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `${v.join(', ')} share ${key} "${k.slice(0, 60)}…"`);
    };
    expect([...dupes('title'), ...dupes('description')]).toEqual([]);
  });

  test('meta descriptions fit in a search-result snippet (≤ 160 chars)', async () => {
    test.skip(pages.length === 0, 'crawl did not run');
    knownBug('BUG-014', 'Several meta descriptions exceed ~160 chars and get cut off in Google results');
    const long = pages.filter((p) => p.description.length > 160).map((p) => `${p.path} (${p.description.length})`);
    expect(long, `Descriptions Google will truncate: ${long.join(', ')}`).toEqual([]);
  });

  test('titles fit in a search-result headline (≤ 65 chars)', async () => {
    test.skip(pages.length === 0, 'crawl did not run');
    const long = pages.filter((p) => p.title.length > 65).map((p) => `${p.path} (${p.title.length}): ${p.title}`);
    expect(long).toEqual([]);
  });
});

test.describe('Images @US-021', () => {
  for (const path of ['/', '/work', '/products/sparrow', '/careers']) {
    test(`${path}: every image has alt text and none are broken`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      // Force lazy images to load before judging "broken".
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
      });
      await page.waitForLoadState('networkidle').catch(() => {});
      const report = await page.evaluate(() => ({
        missingAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc.slice(0, 80)),
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.slice(0, 80)),
      }));
      expect(report.missingAlt, 'images without alt').toEqual([]);
      expect(report.broken, 'images that failed to load').toEqual([]);
    });
  }
});
