# Claude Code Usage Log

> **Note to self (delete before submitting):** Prompt #1 below is the real, verbatim session that scaffolded this repo. Everything under "What I changed / accepted / rejected" must be **my own review**. The brief says Claude's output must not be submitted verbatim, and a log with no judgment in it is a red flag. The "Corrections found during generation" list is a factual record of where the first draft was wrong. Use it as a starting point for my own review, not as a substitute for it. Prompts #2 and #3 are also real and verbatim. Add an entry for every later prompt (Prompt #4 onward); the brief asks for at least 5.

---

## Prompt #1

**What I asked:**
> Please create playwright repo from scratch as per this assessment *(with `QA-Playwright-Assignment.pdf` attached)*

**What Claude did:**
- Extracted the PDF text and explored techdome.io before writing any code: HTTP headers, all header/footer links, sitemap (69 URLs), robots.txt, page titles, the contact page, the newsletter form, the Pod chat widget, and a 375 px viewport.
- Found that `/contact` has **no native form** (Calendly embed + mailto). It identified the newsletter form (`POST /api/newsletter/subscribe`) and the Pod chat (`POST /api/chat`) as the real enquiry inputs, and redesigned the "contact form" tests around them.
- Probed the newsletter API with invalid-only payloads to learn its contract (400 + `{success:false,message}`), which creates no subscribers.
- Scaffolded the repo in the required structure, adding page objects, a fixtures layer (analytics blocking, console capture), a `knownBug()` helper, and a code-enforced 5-user cap.
- Ran the suite against the live site, fixed its own mistakes (see below), and documented findings.

**Corrections found during generation (factual record):**

| # | First draft | Problem found by running it | Fix |
|---|---|---|---|
| 1 | Newsletter success message looked up *inside* `<form>` | On success the form is **replaced** by a confirmation box, so the locator never matched | Scoped the status lookup to `<main>` (`pages/NewsletterPage.ts`) |
| 2 | "Explore" CTA test matched `name: /^Explore /` | Also matched an "Explore" link to `/insights` | Combined role locator with `a[href^="/products/"]` via `.and()` |
| 3 | Upwork badge located by `/Top Rated Plus/` | Strict-mode violation: two links matched | Used the exact accessible name |
| 4 | LCP "good" threshold via `expect.soft` | `expect.soft` **still fails the test**. The intent was "record, don't gate" | Gate on the "poor" band only; annotate "needs improvement" |
| 5 | Chat XSS test mocked `/api/chat` with a `text/plain` body | **Passed vacuously.** The client rejected the format and never rendered the payload | Probed mocked response shapes, found the `{reply}` contract, and added a positive assertion that the reply *is* rendered before asserting it's inert |
| 6 | Chat error test expected "Couldn't reach Pod" on a 500 | Client shows the server's own `{error}` string plus a "Dismiss error" button | Asserted the real behaviour, including dismiss |
| 7 | Mobile overflow marked as a known bug on every page at 375 px | Only `/` overflows, and it **also** overflows at 768 px | Scoped `knownBug` to `/` at both widths (more precise BUG-001) |
| 8 | Newsletter success test expected the server's `message` to be shown | Still failed after fix #1. Probing with a unique mocked message showed the UI **ignores** `message` and shows fixed copy "Thank you for subscribing." while removing the form. An alternative hypothesis (analytics blocking makes the success path throw) was tested and **disproven** | Assert the fixed copy and that the input is gone |
| 9 | Mobile + desktop menu tests clicked `getByRole('link', {name: /Services Overview/}).first()` / `.visible()` | **Passed for the wrong reason.** The trace showed the click landing on the *footer* link behind the menu overlay. The header menus don't contain that link at all | Scoped to `#mobile-nav` (the hamburger's `aria-controls`) and `<header>`, and filed the missing link as BUG-008 |
| 10 | Ran ad-hoc probe tests while the full suite was running | 7 security tests went "flaky" with `ENOENT` on trace files, because the probe run cleaned the shared `test-results/` folder | Not a site or suite problem. Re-ran the full suite with nothing else running |
| 11 | Header-injection probe sent `<script>` payloads to live `/api/contact` | The tool's safety check blocked it as unsolicited attack traffic against a third party | Kept all injection tests mocked, and documented it as a scoping decision + backlog item US-028 |

**What I changed / accepted / rejected:**
<!-- MY REVIEW GOES HERE. Examples of things worth deciding myself:
     - Do I agree with test.fail() for known bugs vs. letting them stay red? (README explains the trade-off)
     - Are the severities in bugs.md right? Would I rate the CSP gap higher?
     - Is blocking analytics in tests the right call?
     - Did I verify BUG-001 by hand on a real phone / DevTools?
     - Anything I'd simplify or remove? -->

---

## Prompt #2

**What I asked:**
> please check all the edge cases and all possible scenarios are covered and all deliverables are present in this repo and other applicants are also using claude to submit this assessment, so think in unique way to standout from other applicants and submit this assessment, once ready, please let me know to push this to github and then make a UI trigger https://hrm-test-runner.pankajqa2026.workers.dev/ like this link and let me know each steps to follow to make it workable

**What Claude did:**
- Audited its own suite for gaps and **probed the live site before writing tests** (all passive or mocked): 500/429 handling, Enter-key submit, chat keyboard behaviour, trailing slashes and query strings, SEO over all 23 pages, overflow on all 23 pages at 375 px plus landscape, an axe-core scan, CORS, page weight and caching.
- The probe turned up **6 new bugs** (BUG-009 to BUG-014), and showed that BUG-001 was wider than first reported (4 pages, not 1, with a different root element).
- Added 59 tests (131 → 190): newsletter and chat edge cases, all-page mobile overflow, landscape, URL normalisation, history navigation, keyboard focus, an SEO crawl, axe WCAG 2.1 AA, page weight, cache policy, Fast-3G throttling, offline, a real clickjacking iframe attempt, and CORS.
- Added a **traceability reporter** (story → tests → bug, plus `summary.json`), **annotated evidence screenshots** (`npm run evidence`), an opt-in **WebKit/iPhone** project, a **GitHub Actions workflow** (manual + daily, serialized, per-run reports on Pages), and a **Cloudflare Worker trigger page** modelled on the example link, with a 409/429 guard so the public button can't break the 5-user limit.

**Corrections found during generation (factual record):**

| # | First draft | Problem | Fix |
|---|---|---|---|
| 1 | BUG-001 described as "homepage-only, caused by `.blueprint-grid`" | Checking all 23 pages found 4 overflowing pages, with the fixed header wrapper as the leaf offender | Rewrote BUG-001, and the test now covers all pages with an explicit list of known offenders |
| 2 | A 600 KB JavaScript budget as a hard assertion | JS was 662 KB and the test failed, but 600 KB was a number Claude had made up, so the "bug" was an artefact of the threshold | Kept the 3 MB total as the only hard gate; JS weight is recorded as an annotation and observation |
| 3 | Evidence screenshot for BUG-010 taken right after Escape | Captured mid exit-animation, showing focus on a still-fading input rather than the final `<body>` | Wait for the dialog to be hidden before capturing |
| 4 | A "sideways scroll" evidence screenshot | It looked identical to the normal view and proved nothing | Deleted it rather than keep weak evidence |
| 5 | Contrast summary said "40–70 elements per page", then "5 of 6 pages, /services clean" | Both came from scans taken **before scrolling**. Per-page tests flipped between runs (/contact 0 ↔ 9). After scrolling the whole page first, **all 6 pages** fail (homepage 89–103 elements) | Scan after a full scroll; replaced 6 flaky per-page contrast tests with one aggregated site-wide test; corrected the numbers everywhere |
| 6 | Bug summary said "15 findings, 6 Medium" | Miscounted: it's 14 findings, 5 Medium | Corrected |
| 7 | Doc edits made via a double-quoted shell script | Bash expanded the Markdown backticks, garbling BUG-001 (no harmful commands ran; every "command" failed) | Repaired with the Edit tool and stopped doing doc edits through the shell |
| 9 | Traceability reporter used `config.rootDir` for the repo root | That's the *tests* folder. Writing `docs/traceability.md` crashed the reporter and turned a green run's exit code into 1, which would have made every CI run red | Resolve the root from the config file path; a reporting error now only logs a warning |
| 10 | Reporter de-duplicated tests by title | Titles repeat across describe blocks (one per viewport), so the matrix reported 172 tests instead of 190 | Key by Playwright's stable `test.id` and show the describe path |
| 11 | Hamburger test clicked once | Flaky in 1 of ~20 runs: the tap landed before React hydration | `openMobileMenu()` retries only while the menu is still closed; logged the real-user impact as an observation |
| 8 | Old backlog IDs US-021 to US-027 | They collided with the new automated stories US-021 to US-023 | Renumbered the backlog to US-024 to US-030 |

**What I changed / accepted / rejected:**
<!-- MY REVIEW GOES HERE, e.g.:
     - Did I check the new bugs (contrast, chat focus, overflow on /products) by hand?
     - Do I agree BUG-010 is Medium and BUG-009 Low?
     - Is the Worker trigger worth the extra moving parts for a take-home, or should it be optional?
     - Anything I'd cut to keep the repo focused? -->

---

## Prompt #3

**What I asked:**
> why it is blank under test *(screenshot of the runner page: run #2 "Passed" but the Tests column showed "–")*

**What Claude did:**
- Checked GitHub and Pages directly. Run #2 had passed and its `summary.json` **was** published, so the tests were fine and the bug was in the Worker.
- First diagnosis (**incomplete**): the run finishes ~25 s before Pages publishes, and the Worker's `fetch(…, { cf: { cacheTtl: 300 } })` cached the early 404. The fix for that (don't cache 404s, bust the cache) was deployed, but the column was **still blank**.
- Stopped guessing and added a temporary diagnostic route. It showed `cacheHit: true`: the poisoned 404 was sitting in `caches.default` under the same URL key, because a `fetch()` with `cf` cache options writes into the same cache that `cache.match()` reads. `hit.json()` failed on the 404 page, which returned "no summary" forever.
- Real fix: a separate cache key that `fetch()` can't write to, only trust a cached 200 JSON entry (delete anything else), plus a UI change that shows "Publishing…" and re-checks every 30 s instead of "–". Removed the debug route and verified it returns 404 after propagation.

**What I changed / accepted / rejected:**
<!-- MY REVIEW GOES HERE -->

---

## Prompt #4

**What I asked:**

**What Claude did:**

**What I changed / accepted / rejected:**

---

## Prompt #5

**What I asked:**

**What Claude did:**

**What I changed / accepted / rejected:**
