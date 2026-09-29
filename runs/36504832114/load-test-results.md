# Load Test Results

> Generated automatically by `tests/load/concurrent-users.spec.ts` — re-run with `npm run test:load`.

| | |
|---|---|
| **Verdict** | **PASS** |
| Run at | 2026-09-29T00:52:09.814Z |
| Target | https://techdome.io |
| Concurrent users (configured / peak observed) | 5 / 5 (hard cap 5) |
| Journey per user | 4 × (/ → /contact) , sequential within a user |
| Total page loads | 40 |
| Same-origin responses observed | 1413 |
| HTTP 5xx errors | 0 |
| Non-2xx document responses | 0 |
| Wall-clock duration | 16.1 s |

## Assertions

| Check | Threshold | Actual | Result |
|---|---|---|---|
| Concurrency never exceeds cap | ≤ 5 | 5 | ✅ |
| p95 document response time | < 3000 ms | 848 ms | ✅ |
| HTTP 5xx during run | 0 | 0 | ✅ |

## Document response time (ms) — request start → last byte of HTML

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 197 | 508 | 438 | **848** | 1116 |
| `/` | 20 | 197 | 423 | 365 | **709** | 848 |
| `/contact` | 20 | 391 | 592 | 545 | **917** | 1116 |

## Full page load (ms) — navigation start → `load` event (informational, not asserted)

| Page | n | min | avg | p50 | p95 | max |
|---|---|---|---|---|---|---|
| **All** | 40 | 1046 | 1668 | 1617 | **2270** | 2498 |
| `/` | 20 | 1398 | 1805 | 1692 | **2270** | 2393 |
| `/contact` | 20 | 1046 | 1530 | 1447 | **2097** | 2498 |

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
| 1 | 1 | `/` | 200 | 848 | 2393 | 170 |
| 3 | 1 | `/` | 200 | 405 | 2270 | 172 |
| 2 | 1 | `/` | 200 | 375 | 1806 | 173 |
| 5 | 1 | `/` | 200 | 357 | 1692 | 174 |
| 4 | 1 | `/` | 200 | 387 | 2016 | 175 |
| 5 | 1 | `/contact` | 200 | 658 | 1453 | 1866 |
| 2 | 1 | `/contact` | 200 | 661 | 1607 | 1979 |
| 4 | 1 | `/contact` | 200 | 1116 | 2498 | 2191 |
| 3 | 1 | `/contact` | 200 | 417 | 1234 | 2442 |
| 1 | 1 | `/contact` | 200 | 425 | 1236 | 2564 |
| 5 | 2 | `/` | 200 | 365 | 1619 | 3319 |
| 2 | 2 | `/` | 200 | 485 | 1647 | 3586 |
| 3 | 2 | `/` | 200 | 302 | 1530 | 3676 |
| 1 | 2 | `/` | 200 | 280 | 1476 | 3800 |
| 4 | 2 | `/` | 200 | 709 | 1890 | 4690 |
| 5 | 2 | `/contact` | 200 | 404 | 1172 | 4938 |
| 3 | 2 | `/contact` | 200 | 391 | 1248 | 5206 |
| 2 | 2 | `/contact` | 200 | 619 | 1489 | 5233 |
| 1 | 2 | `/contact` | 200 | 749 | 1767 | 5276 |
| 5 | 3 | `/` | 200 | 360 | 1906 | 6111 |
| 3 | 3 | `/` | 200 | 254 | 1681 | 6454 |
| 4 | 2 | `/contact` | 200 | 917 | 2097 | 6580 |
| 2 | 3 | `/` | 200 | 473 | 2143 | 6722 |
| 1 | 3 | `/` | 200 | 320 | 1617 | 7042 |
| 5 | 3 | `/contact` | 200 | 558 | 1423 | 8017 |
| 3 | 3 | `/contact` | 200 | 442 | 1543 | 8135 |
| 1 | 3 | `/contact` | 200 | 407 | 1046 | 8660 |
| 4 | 3 | `/` | 200 | 667 | 2205 | 8677 |
| 2 | 3 | `/contact` | 200 | 692 | 1986 | 8865 |
| 5 | 4 | `/` | 200 | 233 | 1578 | 9440 |
| 3 | 4 | `/` | 200 | 197 | 1634 | 9678 |
| 1 | 4 | `/` | 200 | 346 | 1724 | 9706 |
| 2 | 4 | `/` | 200 | 548 | 1869 | 10851 |
| 4 | 3 | `/contact` | 200 | 791 | 1978 | 10882 |
| 5 | 4 | `/contact` | 200 | 524 | 1447 | 11018 |
| 3 | 4 | `/contact` | 200 | 438 | 1484 | 11312 |
| 1 | 4 | `/contact` | 200 | 403 | 1398 | 11429 |
| 2 | 4 | `/contact` | 200 | 545 | 1168 | 12721 |
| 4 | 4 | `/` | 200 | 558 | 1398 | 12860 |
| 4 | 4 | `/contact` | 200 | 689 | 1335 | 14258 |

</details>
