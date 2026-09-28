import { test, expect } from '../../utils/fixtures';

/** High-signal secret formats. Deliberately specific — a generic "long random string" rule drowns in Next.js build hashes. */
const SECRET_PATTERNS: [string, RegExp][] = [
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['OpenAI / Anthropic key', /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['Stripe live key', /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['DB connection string', /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s"'<>]+:[^\s"'<>]+@/],
];

/** Addresses Techdome publishes on purpose. Anything else in page source is flagged for review. */
const PUBLIC_EMAIL_DOMAINS = ['techdome.net.in', 'techdome.io', 'example.com'];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
// Asset filenames like "logo@2x.png" look like emails.
const NOT_AN_EMAIL = /\.(png|jpe?g|webp|svg|gif|avif|js|css)$/i;

test.describe('Sensitive data exposure @US-019', () => {
  for (const path of ['/', '/contact', '/careers', '/newsletter']) {
    test(`${path}: no secrets or unexpected emails in HTML or same-origin responses`, async ({ page, baseURL }) => {
      const origin = new URL(baseURL!).origin;
      const bodies: { url: string; text: string }[] = [];
      page.on('response', async (res) => {
        const url = res.url();
        const type = res.headers()['content-type'] ?? '';
        if (!url.startsWith(origin) || !/(html|javascript|json|text\/x-component)/.test(type)) return;
        try { bodies.push({ url, text: await res.text() }); } catch { /* body evicted after navigation */ }
      });

      await page.goto(path, { waitUntil: 'load' });
      await page.mouse.wheel(0, 5000);
      await page.waitForTimeout(1500);
      bodies.push({ url: `${path} (rendered DOM)`, text: await page.content() });
      expect(bodies.length).toBeGreaterThan(1);

      const secrets: string[] = [];
      const emails = new Set<string>();
      for (const { url, text } of bodies) {
        for (const [label, re] of SECRET_PATTERNS) {
          const m = re.exec(text);
          if (m) secrets.push(`${label} in ${url}: ${m[0].slice(0, 12)}…`);
        }
        for (const e of text.match(EMAIL) ?? []) {
          if (NOT_AN_EMAIL.test(e)) continue;
          const domain = e.split('@')[1].toLowerCase();
          if (!PUBLIC_EMAIL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) emails.add(e);
        }
      }
      await test.info().attach('scanned-urls.txt', { body: bodies.map((b) => b.url).join('\n') });

      expect(secrets, secrets.join('\n')).toEqual([]);
      expect([...emails], `Non-Techdome email addresses exposed in source: ${[...emails].join(', ')}`).toEqual([]);
    });
  }

  test('all sub-resources are served over HTTPS (no mixed content)', async ({ page }) => {
    const insecure: string[] = [];
    page.on('request', (req) => { if (req.url().startsWith('http://')) insecure.push(req.url()); });
    await page.goto('/', { waitUntil: 'load' });
    expect(insecure).toEqual([]);
  });

  test('cookies set on first visit are Secure', async ({ page, context }) => {
    await page.goto('/', { waitUntil: 'load' });
    const cookies = await context.cookies();
    const weak = cookies.filter((c) => c.domain.includes('techdome.io') && !c.secure);
    expect(weak.map((c) => c.name)).toEqual([]);
  });
});
