import { test, expect } from '@playwright/test';
import { knownBug } from '../../utils/helpers';

const PAGES = ['/', '/contact', '/newsletter'];

test.describe('HTTP security headers @US-017', () => {
  for (const path of PAGES) {
    test.describe(path, () => {
      let headers: Record<string, string>;
      test.beforeEach(async ({ request }) => {
        const res = await request.get(path);
        expect(res.status()).toBe(200);
        headers = res.headers();
      });

      test('X-Frame-Options prevents clickjacking', async () => {
        expect(headers['x-frame-options'], 'x-frame-options').toMatch(/^(DENY|SAMEORIGIN)$/i);
      });

      test('Content-Security-Policy is present', async () => {
        knownBug('BUG-002', 'No Content-Security-Policy header on HTML responses');
        const csp = headers['content-security-policy'] ?? headers['content-security-policy-report-only'];
        expect(csp, 'content-security-policy').toBeTruthy();
        expect(csp).toMatch(/default-src|script-src/);
      });

      test('Strict-Transport-Security enforces HTTPS for at least a year', async () => {
        const hsts = headers['strict-transport-security'];
        expect(hsts, 'strict-transport-security').toBeTruthy();
        const maxAge = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
        expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
        expect(hsts).toMatch(/includeSubDomains/i);
      });

      test('X-Content-Type-Options, Referrer-Policy and Permissions-Policy are set', async () => {
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['referrer-policy']).toMatch(/strict-origin|no-referrer|same-origin/);
        expect(headers['permissions-policy']).toMatch(/camera=\(\)/);
      });

      test('no framework / version disclosure headers', async () => {
        expect(headers['x-powered-by'], 'x-powered-by').toBeUndefined();
        expect(headers['server'] ?? '').not.toMatch(/\d+\.\d+/); // e.g. "nginx/1.18.0"
      });
    });
  }

  test('plain HTTP redirects permanently to HTTPS', async ({ request }) => {
    const res = await request.get('http://techdome.io/', { maxRedirects: 0, failOnStatusCode: false });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()['location']).toMatch(/^https:\/\/techdome\.io\/?/);
  });

  test('clickjacking: a hostile page cannot actually frame the site', async ({ page }) => {
    // Header presence is one thing; this proves the browser really refuses to render it.
    await page.goto('about:blank');
    await page.setContent('<h1>attacker.example</h1><iframe id="victim" src="https://techdome.io/contact" width="800" height="600"></iframe>');
    await page.waitForTimeout(4000);
    const frame = page.frames().find((f) => f !== page.mainFrame());
    const rendered = frame ? await frame.evaluate(() => document.title).catch(() => '') : '';
    expect(rendered, 'framed page rendered its content').not.toMatch(/Techdome/);
  });

  test('API does not grant cross-origin read access (CORS)', async ({ request }) => {
    // Benign rejected payload; only the response headers matter.
    const res = await request.post('/api/newsletter/subscribe', { data: {}, headers: { Origin: 'https://attacker.example' } });
    const acao = res.headers()['access-control-allow-origin'];
    expect(acao === undefined || acao === 'https://techdome.io', `access-control-allow-origin: ${acao}`).toBe(true);
    expect(res.headers()['access-control-allow-credentials']).not.toBe('true');
  });

  test('API responses are not cacheable by shared caches', async ({ request }) => {
    const res = await request.post('/api/newsletter/subscribe', { data: {} }); // rejected payload; creates nothing
    const cc = res.headers()['cache-control'] ?? '';
    expect(cc, `cache-control on API error response: "${cc}"`).not.toMatch(/public|s-maxage/);
  });
});
