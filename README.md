# techdome.io: Playwright QA Suite

End-to-end, integration, security, accessibility and load tests for [techdome.io](https://techdome.io), with a user story map, a bug report with screenshots, and a story → test → bug traceability matrix generated from every run.

> **▶ Run it yourself:** _add your Worker URL here after following [`docs/runner-setup.md`](docs/runner-setup.md)_. One click starts the suite on GitHub Actions and opens the report.

```bash
npm install
npx playwright install chromium
npx playwright test
```

That one command runs everything: `e2e`, `integration` and `security` in parallel (≤ 4 workers), then `load` **on its own** after they finish. Open the report with `npx playwright show-report`. Needs Node 18+. The target defaults to `https://techdome.io`; override it with `BASE_URL=…`.

## At a glance

| | |
|---|---|
| Tests | **190**: e2e 138 · integration 19 · security 32 · load 1 (brief minimum: 8 / 3 / 3 / 1) |
| User stories | **23 automated** + 7 backlog, with personas specific to Techdome ([story map](docs/user-story-map.md)) |
| Bugs | **14**: 5 Medium · 9 Low, each with steps and evidence, 6 with screenshots ([bug report](docs/bugs.md)) |
| Load | Exactly 5 concurrent users, 40 page loads, 0 × 5xx, p95 ≈ 1 s against a 3 s budget ([results](docs/load-test-results.md)) |
| Traceability | Story → tests → outcome → bug, regenerated per run ([matrix](docs/traceability.md)) |

## Repo layout

```
tests/
  e2e/            homepage · navigation (23 pages, URL edge cases, keyboard) · newsletter (validation,
                  Enter, double-submit, 429/500/offline) · contact/Calendly · CTAs · footer ·
                  mobile (all 23 pages at 375 px, 768 px, landscape) · performance (LCP/CLS) ·
                  console health · Pod chat · SEO crawl · accessibility (axe WCAG 2.1 AA)
  integration/    form → network payloads · API status codes · full sitemap crawl · third-party
                  scripts · page weight · caching · Fast-3G · offline
  security/       headers · real clickjacking attempt · CORS · injection (mocked) · secret/email leak scan
  load/           exactly 5 concurrent users → writes docs/load-test-results.md
pages/            page objects: BasePage, HomePage, NewsletterPage, ContactPage, ChatWidget
utils/
  fixtures.ts     page-object fixtures, analytics blocking, console-error capture
  helpers.ts      MAX_CONCURRENT_USERS, knownBug(), overflow detector, bounded concurrency, percentile
reporters/        traceability-reporter.ts → summary.json + traceability.md every run
evidence/         opt-in project that regenerates the annotated screenshots in docs/evidence/
.github/workflows e2e.yml: manual + daily runs, serialized, report per run on GitHub Pages
worker/           Cloudflare Worker: the "Run it yourself" page
docs/
  user-story-map.md · bugs.md · load-test-results.md · claude-code-log.md
  traceability.md · runner-setup.md · loom-walkthrough.md · evidence/*.png
```

## Scripts

| Command | What it does |
|---|---|
| `npx playwright test` / `npm test` | Everything; load runs last, alone |
| `npm run test:e2e` · `test:integration` · `test:security` | One project |
| `npm run test:load` | Load test only (skips the functional dependencies) |
| `npm run test:strict` | Functional suite with known-bug annotations **off**, so every bug shows as a red failure |
| `npm run test:docs` | Full run that also refreshes `docs/traceability.md` |
| `npm run evidence` | Regenerates the bug screenshots in `docs/evidence/` |
| `npm run test:cross-browser` | Phone-persona specs on real WebKit / iPhone 13 (run `npx playwright install webkit` first) |
| `npx playwright test -g @US-009` | One user story |
| `npm run typecheck` | `tsc` over the whole repo |

## Design decisions & trade-offs

**The 5-user load limit is enforced at four levels, not just intended.**
1. `MAX_CONCURRENT_USERS = 5` in `utils/helpers.ts`. The load test asserts `USERS ≤ cap`, runs one browser context per user in a single worker, and asserts the peak from a live in-flight gauge.
2. The `load` project *depends on* the functional projects, so no other test traffic overlaps the measurement. `workers` is clamped in the config, and `mapWithConcurrency()` refuses any limit above the cap.
3. CI: a single `concurrency` group with no cancellation, so two runs can never overlap (overlapping load tests would be 10 users).
4. The public trigger page refuses to start a run while one is active (409) and enforces a cool-down (429).

**Known bugs are `test.fail()`, not deleted or skipped.**
Tests that reproduce a confirmed bug call `knownBug('BUG-0xx', …)`. They still run, and they show as 🐞 in the report and the traceability matrix. When Techdome fixes a bug, the test flips to "expected to fail but passed", which fails the run and prompts an update to `bugs.md`. With the daily CI schedule, the suite doubles as a regression monitor. `npm run test:strict` shows every bug as a plain red failure.

**Nothing writes to production, and no attack payloads reach it.**
The newsletter and chat backends are mocked in UI tests, so the suite doesn't add real subscribers or spend Techdome's LLM budget. Those contracts were verified against the live API with **invalid-only** payloads, and by probing the client with mocked response shapes. Injection tests exercise the browser (client-side validation, how output is rendered, prompt-injected chat replies) against mocked endpoints. Server-side attack testing on someone else's production needs written permission, so it's backlog item US-028.

**Analytics are blocked by default.** The fixtures abort GTM/GA so tests don't inflate Techdome's traffic stats. The third-party spec opts back in, because that is what it tests.

**Selectors: role + accessible name first.** The markup is Tailwind utility classes with no `data-testid`, so class selectors would break on every restyle. Where the site has no accessible name (the newsletter input) the test falls back to placeholder, with a comment, and the gap is filed as BUG-003. Locators are **scoped to their container** (`#mobile-nav`, `<header>`), because an unscoped one once passed by clicking the footer. That's how BUG-008 was found.

**Tests guard against passing vacuously.** For example, the chat XSS test first asserts that the mocked reply *is* rendered before asserting it's inert. An earlier draft passed without ever rendering the payload (see the Claude log).

**Live-site realities.** `retries: 1` absorbs network blips, and a retried pass shows as *flaky*, not hidden. Social networks and Upwork return 403/999 to bots, so they get structural checks instead of status checks. Performance gates only on Google's "poor" band, and "needs improvement" is annotated. Budgets are only asserted where there's an objective threshold. A made-up JS budget was removed rather than kept as a "bug".

## Submission checklist (from the brief)

| Requirement | Where |
|---|---|
| `docs/user-story-map.md`: all test types, IDs, acceptance criteria | ✅ [user-story-map.md](docs/user-story-map.md): 23 stories + backlog, coverage table |
| E2E ≥ 8, Integration ≥ 3, Security ≥ 3, Load exactly 5 users | ✅ 138 / 19 / 32 / 1 (5 users, asserted) |
| `docs/claude-code-log.md`: ≥ 5 interactions with judgment | ⚠️ 2 real prompts logged with 19 recorded corrections; **candidate adds own judgment + further prompts** |
| `docs/bugs.md`: severity, steps, evidence | ✅ 14 bugs, 6 with screenshots |
| `docs/load-test-results.md` | ✅ generated by every load run |
| README: `npx playwright test` works from a fresh clone | ✅ |
| Loom walkthrough (5–10 min) | 📝 outline in [loom-walkthrough.md](docs/loom-walkthrough.md) |
| Folder structure: `tests/{e2e,integration,security,load}`, `utils/helpers.ts`, `utils/fixtures.ts` | ✅ |

## Headline findings

- **BUG-001 (Medium):** 4 pages overflow horizontally on phones (plus the homepage at 768 px and in landscape), and the hamburger is clipped
- **BUG-002 (Medium):** no `Content-Security-Policy`
- **BUG-003 (Medium):** the newsletter email field has no label or autofill hint
- **BUG-010 (Medium):** the Pod chat modal doesn't trap focus or restore it on close
- **BUG-011 (Medium):** site-wide low-contrast text (2.56:1)
- 9 Low: truncated product titles, homepage title on the 404 page, orphaned `/api/contact`, weak client-side email check, `/services` missing from the header menus, outages blamed on the visitor's network, 60 s image caching, no skip link, over-long meta descriptions
