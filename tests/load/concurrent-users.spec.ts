import { test, expect, type Browser } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MAX_CONCURRENT_USERS, percentile } from '../../utils/helpers';

/**
 * LOAD TEST — HARD LIMIT: 5 CONCURRENT USERS.
 *
 * How the limit is guaranteed (not just intended):
 *   1. USERS is asserted <= MAX_CONCURRENT_USERS before anything runs.
 *   2. All users live inside this ONE test, in ONE worker. Playwright config
 *      runs the `load` project only after the functional projects finish, so no
 *      other test traffic overlaps with this measurement.
 *   3. Each user is a single browser context performing its journey sequentially,
 *      so one user == at most one in-flight navigation.
 *   4. A live gauge tracks in-flight users; the peak is asserted and reported.
 *
 * Only Techdome's own origin is loaded. Third parties (GTM, Calendly) are
 * blocked so we measure Techdome's server and don't generate 40 fake views on
 * a real person's Calendly page or in Techdome's analytics.
 */
const USERS = 5;
const ITERATIONS = 4; // per user, per page → 5 × 4 × 2 = 40 page loads
const PAGES = ['/', '/contact'] as const;
const P95_BUDGET_MS = 3000;

type Sample = { user: number; iteration: number; page: string; status: number; responseMs: number; loadMs: number; startedAt: number };

test.describe.configure({ mode: 'serial' });

test(`exactly ${USERS} concurrent users: p95 < ${P95_BUDGET_MS}ms and zero 5xx @US-020`, async ({ browser, baseURL }) => {
  expect(USERS, 'USERS must never exceed the hard cap').toBeLessThanOrEqual(MAX_CONCURRENT_USERS);
  expect(USERS).toBe(5);

  const origin = new URL(baseURL!).origin;
  const samples: Sample[] = [];
  const serverErrors: { url: string; status: number }[] = [];
  let subResources = 0;
  let inFlight = 0;
  let peak = 0;
  const t0 = Date.now();

  // Barrier: every user waits until all 5 contexts are ready, then they start together.
  let release!: () => void;
  const startGun = new Promise<void>((r) => (release = r));
  let ready = 0;

  async function runUser(b: Browser, user: number) {
    const context = await b.newContext({ baseURL: origin });
    await context.route((url) => url.origin !== origin, (route) => route.abort('blockedbyclient'));
    const page = await context.newPage();
    page.on('response', (res) => {
      if (!res.url().startsWith(origin)) return;
      subResources++;
      if (res.status() >= 500) serverErrors.push({ url: res.url(), status: res.status() });
    });

    if (++ready === USERS) release();
    await startGun;

    inFlight++;
    peak = Math.max(peak, inFlight);
    if (inFlight > MAX_CONCURRENT_USERS) throw new Error(`Concurrency guard tripped: ${inFlight} users in flight`);
    try {
      for (let iteration = 1; iteration <= ITERATIONS; iteration++) {
        for (const p of PAGES) {
          const startedAt = Date.now() - t0;
          const started = performance.now();
          const response = await page.goto(p, { waitUntil: 'load', timeout: 30_000 });
          const loadMs = performance.now() - started;
          const timing = response!.request().timing();
          samples.push({ user, iteration, page: p, status: response!.status(), responseMs: timing.responseEnd, loadMs, startedAt });
        }
      }
    } finally {
      inFlight--;
      await context.close();
    }
  }

  await Promise.all(Array.from({ length: USERS }, (_, i) => runUser(browser, i + 1)));
  const wallMs = Date.now() - t0;

  // ---- Summarise ---------------------------------------------------------------
  const byPage = (p?: string) => samples.filter((s) => !p || s.page === p);
  const stats = (rows: Sample[], key: 'responseMs' | 'loadMs') => {
    const v = rows.map((r) => r[key]);
    return {
      n: v.length,
      min: Math.round(Math.min(...v)),
      avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
      p50: Math.round(percentile(v, 50)),
      p95: Math.round(percentile(v, 95)),
      max: Math.round(Math.max(...v)),
    };
  };
  const overall = stats(byPage(), 'responseMs');
  const non2xx = samples.filter((s) => s.status >= 400);
  const verdict = overall.p95 < P95_BUDGET_MS && serverErrors.length === 0 && peak <= MAX_CONCURRENT_USERS ? 'PASS' : 'FAIL';

  const row = (label: string, s: ReturnType<typeof stats>) => `| ${label} | ${s.n} | ${s.min} | ${s.avg} | ${s.p50} | **${s.p95}** | ${s.max} |`;
  const md = `# Load Test Results

> Generated automatically by \`tests/load/concurrent-users.spec.ts\` — re-run with \`npm run test:load\`.

| | |
|---|---|
| **Verdict** | **${verdict}** |
| Run at | ${new Date().toISOString()} |
| Target | ${origin} |
| Concurrent users (configured / peak observed) | ${USERS} / ${peak} (hard cap ${MAX_CONCURRENT_USERS}) |
| Journey per user | ${ITERATIONS} × (${PAGES.join(' → ')}) , sequential within a user |
| Total page loads | ${samples.length} |
| Same-origin responses observed | ${subResources} |
| HTTP 5xx errors | ${serverErrors.length} |
| Non-2xx document responses | ${non2xx.length} |
| Wall-clock duration | ${(wallMs / 1000).toFixed(1)} s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ ${MAX_CONCURRENT_USERS} | ${peak} | ${peak <= MAX_CONCURRENT_USERS ? '✅' : '❌'} |
| p95 document response time | < ${P95_BUDGET_MS} ms | ${overall.p95} ms | ${overall.p95 < P95_BUDGET_MS ? '✅' : '❌'} |
| HTTP 5xx during run | 0 | ${serverErrors.length} | ${serverErrors.length === 0 ? '✅' : '❌'} |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
${row('**All**', overall)}
${PAGES.map((p) => row(`\`${p}\``, stats(byPage(p), 'responseMs'))).join('\n')}

## Full page load (ms) — navigation start → \`load\` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
${row('**All**', stats(byPage(), 'loadMs'))}
${PAGES.map((p) => row(`\`${p}\``, stats(byPage(p), 'loadMs'))).join('\n')}

## Method & trade-offs

- **Why Playwright and not k6:** the brief allows either. Playwright keeps the suite to one toolchain and one command, and measures real browser navigations (HTML + JS + RSC fetches) rather than a bare HTML GET. The cost is that 5 real Chromium contexts are heavier on the test machine, so the client can add latency; numbers here are an upper bound on server time.
- **"Response time"** is measured as Playwright's \`request.timing().responseEnd\` for the document request (DNS/TLS on first hit + TTFB + HTML download). That is the metric the p95 budget is asserted on.
- **Third parties blocked:** GTM and Calendly are aborted so the run measures Techdome's origin only and does not inflate analytics or a real person's Calendly views.
- **Cache caveat:** responses carry \`x-nextjs-cache: HIT\` / \`s-maxage=60\`, so most requests are served from Next.js's ISR cache. This measures the site as real visitors experience it, not worst-case uncached rendering.
- **Scale:** 5 users is a smoke-level load test by design (assignment hard limit). It proves the site is healthy under light concurrency; it says nothing about capacity limits.
${serverErrors.length ? `\n## 5xx responses\n\n${serverErrors.map((e) => `- ${e.status} ${e.url}`).join('\n')}\n` : ''}
## Raw samples

<details><summary>${samples.length} samples</summary>

| user | iter | page | status | response ms | load ms | t+ms |
|---|---|---|---|---|---|---|
${samples.sort((a, b) => a.startedAt - b.startedAt).map((s) => `| ${s.user} | ${s.iteration} | \`${s.page}\` | ${s.status} | ${Math.round(s.responseMs)} | ${Math.round(s.loadMs)} | ${s.startedAt} |`).join('\n')}

</details>
`;

  const out = path.join(__dirname, '..', '..', 'docs', 'load-test-results.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  await test.info().attach('load-test-results.md', { body: md, contentType: 'text/markdown' });
  await test.info().attach('load-samples.json', { body: JSON.stringify({ samples, serverErrors, peak }, null, 2), contentType: 'application/json' });

  test.info().annotations.push({ type: 'p95', description: `${overall.p95} ms document p95 · peak ${peak}/${MAX_CONCURRENT_USERS} users · ${serverErrors.length} × 5xx` });
  expect(peak, 'peak concurrent users').toBeLessThanOrEqual(MAX_CONCURRENT_USERS);
  expect(samples).toHaveLength(USERS * ITERATIONS * PAGES.length);
  expect(serverErrors, 'HTTP 5xx responses during load').toEqual([]);
  expect(overall.p95, `p95 document response time (ms) — budget ${P95_BUDGET_MS}`).toBeLessThan(P95_BUDGET_MS);
});
