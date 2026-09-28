# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-28T20:48:05.041Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1428 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 13.9 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 657 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 159 | 360 | 352 | **657** | 719 |
| `/` | 20 | 159 | 275 | 207 | **628** | 719 |
| `/contact` | 20 | 299 | 446 | 413 | **657** | 660 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 713 | 1533 | 1482 | **2194** | 2245 |
| `/` | 20 | 1332 | 1693 | 1629 | **2202** | 2245 |
| `/contact` | 20 | 713 | 1372 | 1418 | **1803** | 1927 |

## Method & trade-offs

- **Why Playwright and not k6:** the brief allows either. Playwright keeps the suite to one toolchain and one command, and measures real browser navigations (HTML + JS + RSC fetches) rather than a bare HTML GET. The cost is that 5 real Chromium contexts are heavier on the test machine, so the client can add latency; numbers here are an upper bound on server time.
- **"Response time"** is measured as Playwright's `request.timing().responseEnd` for the document request (DNS/TLS on first hit + TTFB + HTML download). That is the metric the p95 budget is asserted on.
- **Third parties blocked:** GTM and Calendly are aborted so the run measures Techdome's origin only and does not inflate analytics or a real person's Calendly views.
- **Cache caveat:** responses carry `x-nextjs-cache: HIT` / `s-maxage=60`, so most requests are served from Next.js's ISR cache. This measures the site as real visitors experience it, not worst-case uncached rendering.
- **Scale:** 5 users is a smoke-level load test by design (assignment hard limit). It proves the site is healthy under light concurrency; it says nothing about capacity limits.

## Raw samples

<details><summary>40 samples</summary>

| user | iter | page | status | response ms | load ms | t+ms |
|---|---|---|---|---|---|---|
| 3 | 1 | `/` | 200 | 719 | 2202 | 185 |
| 2 | 1 | `/` | 200 | 628 | 2245 | 186 |
| 1 | 1 | `/` | 200 | 187 | 1448 | 187 |
| 5 | 1 | `/` | 200 | 529 | 1920 | 187 |
| 4 | 1 | `/` | 200 | 179 | 1341 | 188 |
| 4 | 1 | `/contact` | 200 | 413 | 1417 | 1529 |
| 1 | 1 | `/contact` | 200 | 572 | 1421 | 1635 |
| 5 | 1 | `/contact` | 200 | 371 | 1022 | 2106 |
| 3 | 1 | `/contact` | 200 | 511 | 1423 | 2387 |
| 2 | 1 | `/contact` | 200 | 474 | 1525 | 2432 |
| 4 | 2 | `/` | 200 | 208 | 1486 | 2946 |
| 1 | 2 | `/` | 200 | 216 | 1827 | 3056 |
| 5 | 2 | `/` | 200 | 258 | 1746 | 3129 |
| 3 | 2 | `/` | 200 | 242 | 1482 | 3810 |
| 2 | 2 | `/` | 200 | 173 | 1362 | 3957 |
| 4 | 2 | `/contact` | 200 | 589 | 1515 | 4432 |
| 5 | 2 | `/contact` | 200 | 471 | 1256 | 4875 |
| 1 | 2 | `/contact` | 200 | 465 | 1192 | 4883 |
| 3 | 2 | `/contact` | 200 | 352 | 985 | 5291 |
| 2 | 2 | `/contact` | 200 | 364 | 1418 | 5319 |
| 4 | 3 | `/` | 200 | 207 | 1332 | 5947 |
| 1 | 3 | `/` | 200 | 209 | 1767 | 6074 |
| 5 | 3 | `/` | 200 | 187 | 1460 | 6132 |
| 3 | 3 | `/` | 200 | 286 | 1834 | 6276 |
| 2 | 3 | `/` | 200 | 327 | 2194 | 6737 |
| 4 | 3 | `/contact` | 200 | 657 | 1803 | 7279 |
| 5 | 3 | `/contact` | 200 | 465 | 1562 | 7591 |
| 1 | 3 | `/contact` | 200 | 402 | 1326 | 7841 |
| 3 | 3 | `/contact` | 200 | 299 | 1109 | 8110 |
| 2 | 3 | `/contact` | 200 | 373 | 1927 | 8931 |
| 4 | 4 | `/` | 200 | 191 | 1629 | 9082 |
| 5 | 4 | `/` | 200 | 198 | 1784 | 9153 |
| 1 | 4 | `/` | 200 | 194 | 1594 | 9168 |
| 3 | 4 | `/` | 200 | 159 | 1676 | 9220 |
| 4 | 4 | `/contact` | 200 | 427 | 1531 | 10711 |
| 1 | 4 | `/contact` | 200 | 366 | 1442 | 10762 |
| 2 | 4 | `/` | 200 | 200 | 1536 | 10858 |
| 3 | 4 | `/contact` | 200 | 660 | 1477 | 10896 |
| 5 | 4 | `/contact` | 200 | 353 | 1377 | 10937 |
| 2 | 4 | `/contact` | 200 | 325 | 713 | 12394 |

</details>
