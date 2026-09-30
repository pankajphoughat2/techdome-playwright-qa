# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-30T00:54:28.016Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1419 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 18.1 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 781 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 117 | 341 | 330 | **781** | 1065 |
| `/` | 20 | 117 | 284 | 178 | **845** | 1065 |
| `/contact` | 20 | 303 | 397 | 346 | **569** | 572 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 1276 | 2036 | 1838 | **3160** | 3376 |
| `/` | 20 | 1514 | 2313 | 2288 | **3216** | 3376 |
| `/contact` | 20 | 1276 | 1759 | 1732 | **2127** | 2357 |

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
| 1 | 1 | `/` | 200 | 248 | 2288 | 209 |
| 2 | 1 | `/` | 200 | 226 | 2465 | 210 |
| 5 | 1 | `/` | 200 | 166 | 2399 | 211 |
| 3 | 1 | `/` | 200 | 234 | 2554 | 212 |
| 4 | 1 | `/` | 200 | 226 | 2696 | 212 |
| 1 | 1 | `/contact` | 200 | 344 | 1797 | 2497 |
| 5 | 1 | `/contact` | 200 | 343 | 1751 | 2610 |
| 2 | 1 | `/contact` | 200 | 330 | 1494 | 2676 |
| 3 | 1 | `/contact` | 200 | 352 | 1608 | 2766 |
| 4 | 1 | `/contact` | 200 | 345 | 1499 | 2907 |
| 2 | 2 | `/` | 200 | 174 | 1514 | 4170 |
| 1 | 2 | `/` | 200 | 191 | 1875 | 4293 |
| 5 | 2 | `/` | 200 | 188 | 1996 | 4361 |
| 3 | 2 | `/` | 200 | 178 | 2095 | 4374 |
| 4 | 2 | `/` | 200 | 134 | 2321 | 4406 |
| 2 | 2 | `/contact` | 200 | 535 | 2082 | 5684 |
| 1 | 2 | `/contact` | 200 | 355 | 1795 | 6168 |
| 5 | 2 | `/contact` | 200 | 427 | 1755 | 6356 |
| 3 | 2 | `/contact` | 200 | 336 | 1728 | 6469 |
| 4 | 2 | `/contact` | 200 | 346 | 1491 | 6727 |
| 2 | 3 | `/` | 200 | 1065 | 3376 | 7767 |
| 1 | 3 | `/` | 200 | 131 | 2372 | 7963 |
| 5 | 3 | `/` | 200 | 845 | 3160 | 8111 |
| 3 | 3 | `/` | 200 | 130 | 2189 | 8197 |
| 4 | 3 | `/` | 200 | 117 | 2488 | 8219 |
| 1 | 3 | `/contact` | 200 | 572 | 2127 | 10335 |
| 3 | 3 | `/contact` | 200 | 560 | 2357 | 10386 |
| 4 | 3 | `/contact` | 200 | 481 | 2098 | 10706 |
| 2 | 3 | `/contact` | 200 | 332 | 1678 | 11143 |
| 5 | 3 | `/contact` | 200 | 345 | 1602 | 11271 |
| 1 | 4 | `/` | 200 | 781 | 3216 | 12462 |
| 3 | 4 | `/` | 200 | 146 | 1719 | 12743 |
| 4 | 4 | `/` | 200 | 197 | 1789 | 12805 |
| 2 | 4 | `/` | 200 | 162 | 1938 | 12821 |
| 5 | 4 | `/` | 200 | 143 | 1818 | 12873 |
| 3 | 4 | `/contact` | 200 | 410 | 1817 | 14462 |
| 4 | 4 | `/contact` | 200 | 346 | 1838 | 14594 |
| 5 | 4 | `/contact` | 200 | 308 | 1732 | 14690 |
| 2 | 4 | `/contact` | 200 | 303 | 1653 | 14759 |
| 1 | 4 | `/contact` | 200 | 569 | 1276 | 15678 |

</details>
