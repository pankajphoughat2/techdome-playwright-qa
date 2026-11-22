# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security/headers.spec.ts >> HTTP security headers @US-017 >> /contact >> Content-Security-Policy is present
- Location: tests/security/headers.spec.ts:20:11

# Error details

```
Error: content-security-policy

expect(received).toBeTruthy()

Received: undefined
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { knownBug } from '../../utils/helpers';
  3  | 
  4  | const PAGES = ['/', '/contact', '/newsletter'];
  5  | 
  6  | test.describe('HTTP security headers @US-017', () => {
  7  |   for (const path of PAGES) {
  8  |     test.describe(path, () => {
  9  |       let headers: Record<string, string>;
  10 |       test.beforeEach(async ({ request }) => {
  11 |         const res = await request.get(path);
  12 |         expect(res.status()).toBe(200);
  13 |         headers = res.headers();
  14 |       });
  15 | 
  16 |       test('X-Frame-Options prevents clickjacking', async () => {
  17 |         expect(headers['x-frame-options'], 'x-frame-options').toMatch(/^(DENY|SAMEORIGIN)$/i);
  18 |       });
  19 | 
  20 |       test('Content-Security-Policy is present', async () => {
  21 |         knownBug('BUG-002', 'No Content-Security-Policy header on HTML responses');
  22 |         const csp = headers['content-security-policy'] ?? headers['content-security-policy-report-only'];
> 23 |         expect(csp, 'content-security-policy').toBeTruthy();
     |                                                ^ Error: content-security-policy
  24 |         expect(csp).toMatch(/default-src|script-src/);
  25 |       });
  26 | 
  27 |       test('Strict-Transport-Security enforces HTTPS for at least a year', async () => {
  28 |         const hsts = headers['strict-transport-security'];
  29 |         expect(hsts, 'strict-transport-security').toBeTruthy();
  30 |         const maxAge = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
  31 |         expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  32 |         expect(hsts).toMatch(/includeSubDomains/i);
  33 |       });
  34 | 
  35 |       test('X-Content-Type-Options, Referrer-Policy and Permissions-Policy are set', async () => {
  36 |         expect(headers['x-content-type-options']).toBe('nosniff');
  37 |         expect(headers['referrer-policy']).toMatch(/strict-origin|no-referrer|same-origin/);
  38 |         expect(headers['permissions-policy']).toMatch(/camera=\(\)/);
  39 |       });
  40 | 
  41 |       test('no framework / version disclosure headers', async () => {
  42 |         expect(headers['x-powered-by'], 'x-powered-by').toBeUndefined();
  43 |         expect(headers['server'] ?? '').not.toMatch(/\d+\.\d+/); // e.g. "nginx/1.18.0"
  44 |       });
  45 |     });
  46 |   }
  47 | 
  48 |   test('plain HTTP redirects permanently to HTTPS', async ({ request }) => {
  49 |     const res = await request.get('http://techdome.io/', { maxRedirects: 0, failOnStatusCode: false });
  50 |     expect([301, 308]).toContain(res.status());
  51 |     expect(res.headers()['location']).toMatch(/^https:\/\/techdome\.io\/?/);
  52 |   });
  53 | 
  54 |   test('clickjacking: a hostile page cannot actually frame the site', async ({ page }) => {
  55 |     // Header presence is one thing; this proves the browser really refuses to render it.
  56 |     await page.goto('about:blank');
  57 |     await page.setContent('<h1>attacker.example</h1><iframe id="victim" src="https://techdome.io/contact" width="800" height="600"></iframe>');
  58 |     await page.waitForTimeout(4000);
  59 |     const frame = page.frames().find((f) => f !== page.mainFrame());
  60 |     const rendered = frame ? await frame.evaluate(() => document.title).catch(() => '') : '';
  61 |     expect(rendered, 'framed page rendered its content').not.toMatch(/Techdome/);
  62 |   });
  63 | 
  64 |   test('API does not grant cross-origin read access (CORS)', async ({ request }) => {
  65 |     // Benign rejected payload; only the response headers matter.
  66 |     const res = await request.post('/api/newsletter/subscribe', { data: {}, headers: { Origin: 'https://attacker.example' } });
  67 |     const acao = res.headers()['access-control-allow-origin'];
  68 |     expect(acao === undefined || acao === 'https://techdome.io', `access-control-allow-origin: ${acao}`).toBe(true);
  69 |     expect(res.headers()['access-control-allow-credentials']).not.toBe('true');
  70 |   });
  71 | 
  72 |   test('API responses are not cacheable by shared caches', async ({ request }) => {
  73 |     const res = await request.post('/api/newsletter/subscribe', { data: {} }); // rejected payload; creates nothing
  74 |     const cc = res.headers()['cache-control'] ?? '';
  75 |     expect(cc, `cache-control on API error response: "${cc}"`).not.toMatch(/public|s-maxage/);
  76 |   });
  77 | });
  78 | 
```