import { test, expect } from '@playwright/test';
import { mapWithConcurrency } from '../../utils/helpers';

/**
 * Direct HTTP checks. Only non-mutating requests are sent to the live API:
 * GETs, and POSTs whose payload the server must reject (no subscriber is ever
 * created). Attack payloads are never sent to the live backend.
 */
test.describe('Visible API endpoints @US-015', () => {
  test('GET on the subscribe endpoint is rejected with 405 Method Not Allowed', async ({ request }) => {
    const res = await request.get('/api/newsletter/subscribe');
    expect(res.status()).toBe(405);
  });

  test('subscribe endpoint rejects missing / malformed email with 400 and a JSON error', async ({ request }) => {
    for (const data of [{}, { email: 'not-an-email' }, { email: 'a@' }]) {
      const res = await request.post('/api/newsletter/subscribe', { data });
      expect(res.status(), JSON.stringify(data)).toBe(400);
      expect(res.headers()['content-type']).toContain('application/json');
      const json = await res.json();
      expect(json).toMatchObject({ success: false });
      expect(typeof json.message).toBe('string');
    }
  });

  test('subscribe endpoint rejects a non-JSON body with 4xx, not 5xx', async ({ request }) => {
    const res = await request.post('/api/newsletter/subscribe', {
      headers: { 'content-type': 'application/json' },
      data: 'this is not json',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('chat endpoint rejects an empty question with 400', async ({ request }) => {
    const res = await request.post('/api/chat', { data: {} });
    expect(res.status()).toBe(400);
    expect(await res.json()).toHaveProperty('error');
  });

  test('robots.txt and sitemap.xml are served correctly', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    const robotsText = await robots.text();
    expect(robotsText).toMatch(/Sitemap:\s*https:\/\/techdome\.io\/sitemap\.xml/);
    expect(robotsText).toMatch(/Disallow:\s*\/api\//);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()['content-type']).toMatch(/xml/);
  });

  test('every URL in sitemap.xml returns 200', async ({ request }) => {
    test.setTimeout(180_000);
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(20);
    // 3 parallel requests: polite, and well inside the 5-user budget.
    const results = await mapWithConcurrency(urls, 3, async (url) => {
      const res = await request.get(url, { failOnStatusCode: false, maxRedirects: 0, timeout: 30_000 });
      return { url, status: res.status() };
    });
    const bad = results.filter((r) => r.status !== 200);
    expect(bad, `Sitemap URLs not returning 200 (redirects count as bad — a sitemap should list canonical URLs):\n${JSON.stringify(bad, null, 2)}`).toEqual([]);
  });
});
