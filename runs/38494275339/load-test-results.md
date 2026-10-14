# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-28T20:17:05.506Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1440 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 30.9 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 1073 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 364 | 617 | 542 | **1073** | 1395 |
| `/` | 20 | 364 | 460 | 446 | **538** | 542 |
| `/contact` | 20 | 581 | 774 | 703 | **1107** | 1395 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 2138 | 3148 | 3005 | **4133** | 4284 |
| `/` | 20 | 2960 | 3628 | 3605 | **4270** | 4284 |
| `/contact` | 20 | 2138 | 2668 | 2674 | **3083** | 3231 |

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
| 1 | 1 | `/` | 200 | 488 | 3164 | 357 |
| 2 | 1 | `/` | 200 | 542 | 4025 | 358 |
| 3 | 1 | `/` | 200 | 506 | 3657 | 359 |
| 4 | 1 | `/` | 200 | 498 | 3684 | 360 |
| 5 | 1 | `/` | 200 | 535 | 4133 | 361 |
| 1 | 1 | `/contact` | 200 | 762 | 3083 | 3521 |
| 3 | 1 | `/contact` | 200 | 720 | 2530 | 4016 |
| 4 | 1 | `/contact` | 200 | 705 | 2616 | 4045 |
| 2 | 1 | `/contact` | 200 | 585 | 2293 | 4384 |
| 5 | 1 | `/contact` | 200 | 581 | 2138 | 4494 |
| 3 | 2 | `/` | 200 | 457 | 4022 | 6546 |
| 1 | 2 | `/` | 200 | 410 | 4003 | 6604 |
| 5 | 2 | `/` | 200 | 415 | 3934 | 6632 |
| 4 | 2 | `/` | 200 | 435 | 4284 | 6661 |
| 2 | 2 | `/` | 200 | 408 | 4270 | 6677 |
| 5 | 2 | `/contact` | 200 | 704 | 2862 | 10566 |
| 3 | 2 | `/contact` | 200 | 1107 | 3231 | 10568 |
| 1 | 2 | `/contact` | 200 | 659 | 2530 | 10606 |
| 4 | 2 | `/contact` | 200 | 583 | 2474 | 10945 |
| 2 | 2 | `/contact` | 200 | 959 | 2839 | 10947 |
| 1 | 3 | `/` | 200 | 536 | 3233 | 13137 |
| 4 | 3 | `/` | 200 | 538 | 3257 | 13425 |
| 5 | 3 | `/` | 200 | 446 | 3245 | 13428 |
| 2 | 3 | `/` | 200 | 404 | 2960 | 13785 |
| 3 | 3 | `/` | 200 | 431 | 2984 | 13799 |
| 1 | 3 | `/contact` | 200 | 683 | 3005 | 16369 |
| 5 | 3 | `/contact` | 200 | 703 | 2387 | 16673 |
| 4 | 3 | `/contact` | 200 | 1395 | 2801 | 16683 |
| 2 | 3 | `/contact` | 200 | 708 | 2313 | 16746 |
| 3 | 3 | `/contact` | 200 | 676 | 2282 | 16783 |
| 2 | 4 | `/` | 200 | 485 | 3605 | 19058 |
| 5 | 4 | `/` | 200 | 441 | 3485 | 19060 |
| 3 | 4 | `/` | 200 | 479 | 3785 | 19065 |
| 1 | 4 | `/` | 200 | 387 | 3471 | 19375 |
| 4 | 4 | `/` | 200 | 364 | 3358 | 19484 |
| 5 | 4 | `/contact` | 200 | 825 | 2897 | 22545 |
| 2 | 4 | `/contact` | 200 | 1073 | 2957 | 22664 |
| 4 | 4 | `/contact` | 200 | 674 | 2776 | 22843 |
| 1 | 4 | `/contact` | 200 | 681 | 2677 | 22846 |
| 3 | 4 | `/contact` | 200 | 694 | 2674 | 22850 |

</details>
