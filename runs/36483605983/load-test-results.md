# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-28T21:08:48.944Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1422 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 18.0 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 767 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 194 | 471 | 452 | **767** | 1227 |
| `/` | 20 | 194 | 354 | 339 | **504** | 767 |
| `/contact` | 20 | 382 | 587 | 525 | **868** | 1227 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 1078 | 1886 | 1875 | **2823** | 3225 |
| `/` | 20 | 1493 | 2049 | 1981 | **2823** | 2847 |
| `/contact` | 20 | 1078 | 1723 | 1691 | **2286** | 3225 |

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
| 1 | 1 | `/` | 200 | 767 | 2823 | 191 |
| 4 | 1 | `/` | 200 | 305 | 1773 | 192 |
| 2 | 1 | `/` | 200 | 327 | 2157 | 193 |
| 3 | 1 | `/` | 200 | 462 | 2244 | 194 |
| 5 | 1 | `/` | 200 | 339 | 2185 | 195 |
| 4 | 1 | `/contact` | 200 | 382 | 1087 | 1966 |
| 2 | 1 | `/contact` | 200 | 448 | 1383 | 2350 |
| 5 | 1 | `/contact` | 200 | 705 | 1394 | 2380 |
| 3 | 1 | `/contact` | 200 | 742 | 1875 | 2438 |
| 1 | 1 | `/contact` | 200 | 581 | 1647 | 3014 |
| 4 | 2 | `/` | 200 | 194 | 1672 | 3053 |
| 2 | 2 | `/` | 200 | 427 | 2026 | 3733 |
| 5 | 2 | `/` | 200 | 279 | 1930 | 3774 |
| 3 | 2 | `/` | 200 | 504 | 2847 | 4312 |
| 1 | 2 | `/` | 200 | 362 | 2296 | 4661 |
| 4 | 2 | `/contact` | 200 | 401 | 1377 | 4724 |
| 5 | 2 | `/contact` | 200 | 501 | 1749 | 5704 |
| 2 | 2 | `/contact` | 200 | 525 | 1691 | 5759 |
| 4 | 3 | `/` | 200 | 218 | 1977 | 6102 |
| 1 | 2 | `/contact` | 200 | 666 | 2054 | 6956 |
| 3 | 2 | `/contact` | 200 | 621 | 2047 | 7159 |
| 2 | 3 | `/` | 200 | 203 | 1493 | 7450 |
| 5 | 3 | `/` | 200 | 235 | 1650 | 7452 |
| 4 | 3 | `/contact` | 200 | 868 | 2286 | 8079 |
| 2 | 3 | `/contact` | 200 | 501 | 1723 | 8943 |
| 1 | 3 | `/` | 200 | 452 | 1790 | 9010 |
| 5 | 3 | `/contact` | 200 | 460 | 1657 | 9102 |
| 3 | 3 | `/` | 200 | 421 | 1991 | 9206 |
| 4 | 4 | `/` | 200 | 341 | 2222 | 10365 |
| 2 | 4 | `/` | 200 | 233 | 2074 | 10666 |
| 5 | 4 | `/` | 200 | 210 | 1932 | 10759 |
| 1 | 3 | `/contact` | 200 | 563 | 1901 | 10800 |
| 3 | 3 | `/contact` | 200 | 1227 | 3225 | 11197 |
| 4 | 4 | `/contact` | 200 | 480 | 1610 | 12587 |
| 5 | 4 | `/contact` | 200 | 538 | 1851 | 12690 |
| 1 | 4 | `/` | 200 | 422 | 1981 | 12701 |
| 2 | 4 | `/contact` | 200 | 485 | 1739 | 12740 |
| 3 | 4 | `/` | 200 | 385 | 1915 | 14422 |
| 1 | 4 | `/contact` | 200 | 513 | 1078 | 14682 |
| 3 | 4 | `/contact` | 200 | 532 | 1088 | 16337 |

</details>
