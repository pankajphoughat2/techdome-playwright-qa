# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-28T20:30:36.639Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1427 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 17.5 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 567 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 128 | 377 | 351 | **567** | 670 |
| `/` | 20 | 128 | 282 | 273 | **427** | 447 |
| `/contact` | 20 | 301 | 471 | 455 | **617** | 670 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 940 | 1944 | 1911 | **2547** | 2671 |
| `/` | 20 | 1866 | 2201 | 2163 | **2608** | 2671 |
| `/contact` | 20 | 940 | 1687 | 1673 | **2141** | 2463 |

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
| 2 | 1 | `/` | 200 | 177 | 2671 | 197 |
| 1 | 1 | `/` | 200 | 161 | 2547 | 199 |
| 4 | 1 | `/` | 200 | 128 | 2608 | 199 |
| 5 | 1 | `/` | 200 | 304 | 1871 | 200 |
| 3 | 1 | `/` | 200 | 240 | 2167 | 201 |
| 5 | 1 | `/contact` | 200 | 467 | 1459 | 2071 |
| 3 | 1 | `/contact` | 200 | 304 | 1254 | 2367 |
| 1 | 1 | `/contact` | 200 | 448 | 1372 | 2746 |
| 4 | 1 | `/contact` | 200 | 418 | 1325 | 2808 |
| 2 | 1 | `/contact` | 200 | 455 | 1712 | 2869 |
| 5 | 2 | `/` | 200 | 447 | 1866 | 3530 |
| 3 | 2 | `/` | 200 | 378 | 1911 | 3622 |
| 1 | 2 | `/` | 200 | 306 | 2031 | 4117 |
| 4 | 2 | `/` | 200 | 313 | 2219 | 4132 |
| 2 | 2 | `/` | 200 | 427 | 2368 | 4581 |
| 5 | 2 | `/contact` | 200 | 405 | 1844 | 5397 |
| 3 | 2 | `/contact` | 200 | 435 | 1898 | 5532 |
| 1 | 2 | `/contact` | 200 | 670 | 1646 | 6148 |
| 4 | 2 | `/contact` | 200 | 494 | 1656 | 6352 |
| 2 | 2 | `/contact` | 200 | 481 | 1673 | 6949 |
| 5 | 3 | `/` | 200 | 245 | 2145 | 7240 |
| 3 | 3 | `/` | 200 | 239 | 2216 | 7431 |
| 1 | 3 | `/` | 200 | 344 | 2303 | 7795 |
| 4 | 3 | `/` | 200 | 214 | 2405 | 8008 |
| 2 | 3 | `/` | 200 | 241 | 2509 | 8621 |
| 5 | 3 | `/contact` | 200 | 557 | 2074 | 9385 |
| 3 | 3 | `/contact` | 200 | 532 | 1829 | 9647 |
| 1 | 3 | `/contact` | 200 | 344 | 1390 | 10098 |
| 4 | 3 | `/contact` | 200 | 617 | 2141 | 10413 |
| 2 | 3 | `/contact` | 200 | 442 | 1985 | 11130 |
| 5 | 4 | `/` | 200 | 307 | 1891 | 11459 |
| 3 | 4 | `/` | 200 | 273 | 1902 | 11476 |
| 1 | 4 | `/` | 200 | 249 | 2163 | 11488 |
| 4 | 4 | `/` | 200 | 351 | 2138 | 12554 |
| 2 | 4 | `/` | 200 | 303 | 2088 | 13116 |
| 5 | 4 | `/contact` | 200 | 560 | 1943 | 13350 |
| 3 | 4 | `/contact` | 200 | 567 | 1897 | 13378 |
| 1 | 4 | `/contact` | 200 | 533 | 2463 | 13651 |
| 4 | 4 | `/contact` | 200 | 395 | 1241 | 14692 |
| 2 | 4 | `/contact` | 200 | 301 | 940 | 15204 |

</details>
