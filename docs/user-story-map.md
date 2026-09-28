# User Story Map — techdome.io

Explored on 2026-09-28 against the live site (Next.js on Railway behind Cloudflare).

## What the site actually is (and why it shapes the stories)

techdome.io is a **lead-generation site for a venture studio / software agency**. Its money path is not a checkout, it is *"convince a buyer, then get them onto a call"*. After exploring it, the main things I found were:

| Surface | What's really there | Testing implication |
|---|---|---|
| **Contact** (`/contact`) | **No native form.** An embedded **Calendly** scheduler (Rahul Joshi's 30-min slot) plus `mailto:` links. | "Contact form" stories become "book a call" stories. We verify the embed is wired correctly, but we never book real meetings on a real person's calendar. |
| **Newsletter** (`/newsletter`, reused in footers e.g. `/careers`) | The **only native `<form>` that posts to Techdome's backend**: `POST /api/newsletter/subscribe` with `{email, utmSource, utmMedium}`. | This is the "enquiry form" for validation, error-state, payload and injection tests. The backend is **mocked** in UI tests so we never add real subscribers. |
| **Pod AI chat** (every page) | A modal assistant that calls `POST /api/chat` with `{message, history}` and renders `{reply}`. 200-char input limit. | A second free-text input, and one that renders **LLM output**. That makes it an injection target (prompt-injected HTML). Always mocked, since every real call costs Techdome LLM spend. |
| **Proof** | Upwork (Top Rated Plus / 100% JSS), Clutch, Product Hunt (#4 ×2), live product sites (Sparrow, JustInterview.ai, Saral Funding). | Buyers doing due diligence click these. Broken proof links cost more trust than a broken blog link. |
| **Product pages** | 7 in-house ventures under `/products/*`. | Navigation, titles and SEO. |
| **`/api/contact`** | Exists (405 on GET, 400 "Name and email are required") but **no UI uses it.** | Logged as a finding. No attack payloads were sent to it. |

## Personas

| Persona | Who they are on *this* site | Primary journey |
|---|---|---|
| **Non-technical founder** | Has an idea, needs an MVP built. Arrives from Product Hunt / Google on a phone. | Home → Studio → Book a product teardown |
| **CTO / Eng. manager** | Evaluating staff augmentation ("dedicated pods"). Does due diligence. | Services → Staff Augmentation → Upwork/Clutch proof → Contact |
| **Enterprise ops lead** | Wants n8n / AI automation. | Automation → Work (case studies) → Pod chat |
| **Due-diligence reviewer** | Procurement or an investor checking claims. | Proof links, legal pages, security posture |
| **Engineer / candidate** | Job seeker or newsletter reader. | Careers → Life at Techdome → Newsletter |
| **Recruiter / partner** | Looking for socials and company facts. | Footer → LinkedIn / GitHub / About |

---

## Stories

Story IDs match the `@US-xxx` tags in test titles, so `npx playwright test -g @US-004` runs a single story.

### Navigation & page load

#### US-001
**Title:** First impression on the homepage
**As a:** non-technical founder arriving from a Google result
**I want to:** land on the homepage and immediately understand what Techdome does
**So that:** I decide within seconds whether to keep reading or bounce
**Acceptance:**
- [x] `/` returns 200 with title "Techdome — Custom Software Development Company & Venture Studio"
- [x] Meta description exists, mentions "venture studio", and is ≤ 200 chars (fits a SERP snippet)
- [x] Exactly one `<h1>`: "Your product team, fully assembled."
- [x] Both hero CTAs are visible ("Book a product teardown", "See what we've built")
- [x] Open Graph title/image and canonical URL are present, so shared links preview properly
**Test Type:** E2E **Priority:** P0

#### US-002
**Title:** Every page in the menus resolves to real content
**As a:** CTO browsing Services → Staff Augmentation → Products
**I want to:** every header/footer link to open a real page
**So that:** I never hit a 404 or a blank shell while evaluating the company
**Acceptance:**
- [x] All 23 top-level pages return 200, have a page-specific `<title>`, a visible `<h1>`, and > 200 chars of `<main>` text
- [x] Every internal `href` in header + footer resolves with no 4xx/5xx (discovered dynamically, so new links are covered automatically)
- [x] Desktop "What we do" dropdown toggles `aria-expanded` and routes to `/staff-augmentation`
- [ ] "Services Overview" (`/services`) is reachable from the header → **fails, BUG-008** (footer-only)
- [x] The logo returns to `/` from a deep page
- [x] Trailing-slash URLs (`/contact/`) 308-redirect to the canonical path
- [x] UTM / `fbclid` query strings don't break pages, and the canonical drops them
- [x] Browser Back / Forward restore the right page and title
- [x] Unknown URLs return a **real HTTP 404** (not a soft 200) with a way home
- [ ] 404 page has its own title → **fails, BUG-005**
- [ ] Product page titles are not truncated with a literal "..." → **fails, BUG-004**
**Test Type:** E2E **Priority:** P0

### Contact / enquiry

#### US-003
**Title:** Book a 30-minute architecture call
**As a:** founder who is ready to talk
**I want to:** pick a slot on the contact page without leaving the site
**So that:** I get a call with a principal engineer, not a salesperson
**Acceptance:**
- [x] `/contact` renders "Talk to an architect" and exactly one Calendly iframe on `calendly.com/<user>/<event>`
- [x] The iframe actually renders content (not just an empty tag)
- [x] "Open in new tab" targets the **same** Calendly event as the embed, with `target=_blank`
- [x] A `mailto:` fallback on `@techdome.net.in` exists for people whose network blocks Calendly
- Out of scope: completing a booking. It would put fake meetings on a real person's calendar.
**Test Type:** E2E **Priority:** P0

#### US-004
**Title:** Subscribe to the Foundry newsletter
**As a:** senior engineer who liked an Insights essay
**I want to:** enter my email and subscribe
**So that:** I get the engineering dispatch in my inbox
**Acceptance:**
- [x] A valid email shows the server's success message and clears the input
- [x] Double-clicking Subscribe sends **one** request (no duplicate subscriptions)
- [x] Network failure shows "Network error…" and leaves the button usable for a retry
- [x] Pressing **Enter** in the field submits (keyboard-only users)
- [x] While the request is in flight, button and input are disabled
- [x] A 429 rate-limit response shows the server's message and keeps the typed email
- Finding: on success the UI shows fixed copy ("Thank you for subscribing.") and ignores the server's `message`. That's fine, but worth knowing when you change the API.
**Test Type:** E2E **Priority:** P1

#### US-005
**Title:** Newsletter form rejects bad input clearly
**As a:** visitor who mistypes their email
**I want to:** be told what's wrong before anything is submitted
**So that:** I can fix it rather than silently not subscribing
**Acceptance:**
- [x] Empty submit → native `valueMissing`, **no network request**
- [x] `plainaddress`, `missing-at.example.com`, `@no-local-part.com`, `spaces in@example.com` → invalid, no request
- [x] Input that passes client checks but fails on the server (`user@localhost`) → server message is shown and the input is kept
- [ ] Input has an accessible name (label / aria-label) → **fails, BUG-003**
- [ ] Input supports autofill (`autocomplete="email"`) → **fails, BUG-003**
- [ ] A server outage (500 with an HTML body) is not reported as the visitor's network problem → **fails, BUG-009**
**Test Type:** E2E **Priority:** P1

### CTAs & external links

#### US-006
**Title:** Hero and header CTAs go where they promise
**As a:** founder skimming the homepage
**I want to:** "Book a product teardown", "See what we've built" and "Contact Us" to take me to the right place
**So that:** the path from interest to a call has no dead ends
**Acceptance:**
- [x] "Book a product teardown" → `/contact` (h1 "Talk to an architect")
- [x] "See what we've built" → `/work` (title "Case Studies…")
- [x] Header "Contact Us" → `/contact`
- [x] Every product "Explore …" CTA → `/products/<slug>` returning 200
**Test Type:** E2E **Priority:** P0

#### US-007
**Title:** Proof links hold up to due diligence
**As a:** due-diligence reviewer
**I want to:** click the Upwork, Product Hunt and "Visit live" / "Read docs" links
**So that:** I can verify the claims ("100% JSS", "#4 Product of the Day") independently
**Acceptance:**
- [x] Upwork badge → `upwork.com/agencies/techdome`; Product Hunt → `producthunt.com/products/sparrow…`
- [x] Techdome-owned external products (justinterview.ai, saralfunding.com, docs.sparrowapp.dev) return < 400
- [x] Every off-site link opens in a new tab with `rel=noopener` (reverse-tabnabbing protection)
- Trade-off: social networks and Upwork return 403/999 to automated clients, so they get **structural** checks (host, path, target, rel), not status checks. A status check there would test *their* bot protection, not Techdome.
**Test Type:** E2E **Priority:** P1

#### US-008
**Title:** Find Techdome on social and legal pages
**As a:** recruiter or partner
**I want to:** reach LinkedIn, X, Instagram, GitHub, Facebook and the Privacy/Terms pages from the footer
**So that:** I can verify the company and its policies
**Acceptance:**
- [x] Each social icon exists once, is visible, points to Techdome's own handle, opens in a new tab with `noopener`, and has an accessible name ("Techdome on LinkedIn")
- [x] Privacy, Terms, FAQ, Careers links route correctly
- [x] Footer shows the current year
**Test Type:** E2E **Priority:** P2

### Mobile responsiveness

#### US-009
**Title:** Browse on a phone (375 px)
**As a:** founder who found Techdome on Product Hunt on their iPhone
**I want to:** use the menu and read the page without sideways scrolling
**So that:** the site feels as credible on mobile as on desktop
**Acceptance:**
- [x] Desktop nav hidden; "Open navigation" hamburger visible
- [x] Hamburger exposes `aria-controls="mobile-nav"`, flips to "Close navigation" + `aria-expanded=true`, and its panel's links navigate (→ `/staff-augmentation`) and close the menu
- [x] Hero heading and primary CTA are in the viewport; CTA ≥ 44 px tall (touch target)
- [x] The menu closes with its own "Close navigation" button, and `aria-expanded` goes back to `false`
- [ ] Hamburger fully inside the viewport → **fails on `/`, BUG-001**
- [ ] No horizontal overflow on **all 23 core pages** → **4 fail (`/`, `/products`, `/automation`, `/life-at-techdome`), BUG-001**
- [ ] Phone landscape 812×375: no overflow → **`/` fails (818 px), BUG-001**
- [x] Landscape: the hero CTA is reachable and routes to `/contact`
**Test Type:** E2E **Priority:** P1

#### US-010
**Title:** Browse on a tablet (768 px)
**As a:** CTO reviewing case studies on an iPad
**I want to:** the tablet layout to reflow cleanly
**So that:** I can read long case studies comfortably
**Acceptance:**
- [x] Collapsed nav with working hamburger at 768 px (the `lg` breakpoint is 1024 px)
- [ ] No horizontal overflow → **`/` fails (774 px wide), BUG-001**
**Test Type:** E2E **Priority:** P2

### Performance & health (beyond minimum)

#### US-011
**Title:** Pages feel fast
**As a:** mobile visitor on an average connection
**I want to:** the main content to paint quickly
**So that:** I don't bounce before the pitch loads
**Acceptance:**
- [x] LCP and CLS recorded for `/`, `/contact`, `/work` (attached to the report)
- [x] Hard gate only on Google's "poor" band (LCP < 4 s, CLS < 0.25). Missing "good" (2.5 s / 0.1) is annotated, not failed, because lab numbers are noisy
**Test Type:** E2E **Priority:** P1

#### US-012
**Title:** No JavaScript errors on key pages
**As a:** any visitor
**I want to:** pages to load without console errors or uncaught exceptions
**So that:** interactive pieces (chat, menus, forms) aren't silently broken
**Acceptance:**
- [x] `/`, `/contact`, `/newsletter`, `/work`, `/products/sparrow`, `/careers`: zero console errors and page errors after scrolling (lazy components included)
**Test Type:** E2E **Priority:** P2

#### US-013
**Title:** Ask Pod, the AI assistant, a question
**As an:** enterprise ops lead with an n8n question at 11 pm
**I want to:** open the chat, ask, and get an answer or a clear error
**So that:** I can qualify Techdome without booking a call yet
**Acceptance:**
- [x] Launcher opens an `aria-modal` dialog; Send is disabled until text is typed; Close hides it
- [x] Input caps at 200 characters
- [x] Whitespace-only input can't be sent (button disabled, Enter does nothing)
- [x] Enter sends; the input clears; the (mocked) reply renders
- [x] Quick-topic cards ("Studio Sprint", …) send a pre-written question as the first history turn
- [x] "Schedule a call" shortcut routes to Calendly / contact
- [ ] Focus stays inside the `aria-modal` dialog while open → **fails, BUG-010**
- [ ] Escape closes it and returns focus to the launcher → **closes, but focus goes to `<body>`, BUG-010**
**Test Type:** E2E **Priority:** P1

### API / form integration

#### US-014
**Title:** Forms send the right data to the right endpoint
**As the:** marketing team relying on newsletter attribution
**I want:** each submission to carry the correct payload and UTM tags
**So that:** subscriber sources are reported accurately
**Acceptance:**
- [x] Newsletter → `POST /api/newsletter/subscribe`, `application/json`, body is exactly `{email, utmSource:"newsletter_page", utmMedium:"form_submission"}`, with the email trimmed
- [x] The same component in the `/careers` footer sends a **different** `utmSource`
- [x] Chat → `POST /api/chat` `{message, history[]}`; the second turn carries the first exchange in `history`
- [x] Chat renders `{reply}`; server `{error}` is shown and dismissable
**Test Type:** Integration **Priority:** P0

#### US-015
**Title:** Visible API endpoints behave correctly
**As a:** developer maintaining the site
**I want:** the public endpoints to return correct status codes
**So that:** clients can rely on them and errors never surface as 5xx
**Acceptance:**
- [x] `GET /api/newsletter/subscribe` → 405
- [x] Missing / malformed email → 400 with JSON `{success:false, message}`; non-JSON body → 4xx, not 5xx
- [x] `POST /api/chat {}` → 400 `{error}`
- [x] `robots.txt` references the sitemap and disallows `/api/`; `sitemap.xml` is XML
- [x] **Every one of the ~69 sitemap URLs returns 200** with no redirects
**Test Type:** Integration **Priority:** P1

#### US-016
**Title:** Third-party scripts never hold the page hostage
**As a:** visitor behind an ad-blocker or a corporate proxy
**I want:** the site to render even when GTM / Calendly are slow or blocked
**So that:** I still see the pitch and can still navigate
**Acceptance:**
- [x] No third-party resource has `renderBlockingStatus: "blocking"`; no synchronous third-party `<script src>`
- [x] GTM loads (200) asynchronously
- [x] With **every** off-origin request aborted, `/` still returns 200, renders the h1, and CTAs still navigate
- [x] Calendly document loads on `/contact`
**Test Type:** Integration **Priority:** P1

### Security

#### US-017
**Title:** Security headers protect visitors
**As a:** due-diligence reviewer checking an agency that will hold our IP
**I want:** the site to send standard security headers
**So that:** I trust their engineering hygiene
**Acceptance:**
- [x] `X-Frame-Options: SAMEORIGIN|DENY` on `/`, `/contact`, `/newsletter`
- [ ] `Content-Security-Policy` present → **fails, BUG-002**
- [x] HSTS `max-age ≥ 1 year; includeSubDomains`
- [x] `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- [x] No `X-Powered-By` / version disclosure; HTTP → 301/308 to HTTPS
- [x] **Clickjacking tested for real:** a hostile page that iframes `/contact` gets nothing rendered, not just a header present
- [x] CORS: the API doesn't grant `Access-Control-Allow-Origin` to a foreign origin
- [x] API error responses are not publicly cacheable
**Test Type:** Security **Priority:** P0

#### US-018
**Title:** Free-text inputs can't be used for script injection
**As a:** site owner
**I want:** script payloads in any input to be rejected or rendered inert
**So that:** visitors can't be attacked through my forms or my AI assistant
**Acceptance:**
- [x] Newsletter field: `<script>alert(1)</script>`, `"><img onerror>`, `<svg/onload>`, `javascript:` are rejected **before a request leaves the browser**
- [x] A server message containing HTML is rendered as literal text (no element injected, no script runs)
- [x] Chat: a user's HTML payload is shown as text
- [x] Chat: an **assistant reply** containing `<img onerror>` and a `javascript:` markdown link renders neither (prompt-injection → XSS defence)
- [x] No JS dialog fires in any of the above
- Note: the brief says "name field", but no form on techdome.io has a name field. Payloads are only ever sent to **mocked** endpoints, never to Techdome's live API.
**Test Type:** Security **Priority:** P0

#### US-019
**Title:** No secrets or private data leak to the browser
**As a:** security reviewer
**I want:** page source and network responses free of credentials and private emails
**So that:** nothing sensitive is harvestable from the public site
**Acceptance:**
- [x] HTML, JS chunks, JSON and RSC payloads on `/`, `/contact`, `/careers`, `/newsletter` contain no AWS/Google/OpenAI/Anthropic/Stripe/GitHub/Slack keys, JWTs, private keys or DB URLs
- [x] The only email addresses present are on Techdome's own public domains
- [x] No mixed content; first-party cookies are `Secure`
**Test Type:** Security **Priority:** P1

### Load

#### US-020
**Title:** Site stays fast with 5 simultaneous visitors
**As the:** Techdome team after a Product Hunt launch
**I want:** the homepage and contact page to stay fast when several people arrive together
**So that:** a traffic spike doesn't lose us leads
**Acceptance:**
- [x] **Exactly 5** concurrent users (hard cap, enforced in code and asserted from a live gauge)
- [x] Each user: 4 × (`/` → `/contact`) = 40 page loads
- [x] p95 document response time < 3000 ms
- [x] Zero HTTP 5xx across all ~1,400 same-origin responses
- [x] Results written to `docs/load-test-results.md`
**Test Type:** Load **Priority:** P0

---

### Beyond the brief: search, accessibility, network

#### US-021
**Title:** Techdome shows up properly in search results
**As a:** CTO googling "n8n automation agency" or "staff augmentation India"
**I want:** each Techdome page to have a unique, complete title and snippet in the results
**So that:** I click through to the right page instead of a competitor's
**Acceptance:**
- [x] All 23 core pages: self-referencing canonical, matching `og:url`, `lang="en"`, exactly one `<h1>`, a meta description
- [x] Titles and descriptions are **unique** across the site; titles ≤ 65 chars
- [ ] Descriptions ≤ 160 chars → **fails on 8 pages, BUG-014**
- [x] No image without `alt`, and no broken image on `/`, `/work`, `/products/sparrow`, `/careers` (after forcing lazy images to load)
**Test Type:** E2E **Priority:** P2

#### US-022
**Title:** Use the site with a keyboard or screen reader
**As a:** visually impaired procurement reviewer using NVDA
**I want:** every page to meet WCAG 2.1 AA
**So that:** I can evaluate Techdome without asking a colleague for help
**Acceptance:**
- [x] axe-core scan of 6 pages finds **no critical or serious violations other than contrast** (hard gate: any new class of violation fails)
- [ ] Text contrast ≥ 4.5:1 → **fails on all 6 pages, BUG-011** (one aggregated test, since it's a site-wide design token)
- [x] Keyboard focus ring is visible on the first Tab stop
- [ ] First Tab stop is a skip link → **fails, BUG-013**
- [ ] Chat modal traps focus and restores it on close → **fails, BUG-010** (see US-013)
- [ ] Newsletter input has a label and `autocomplete="email"` → **fails, BUG-003** (see US-005)
**Test Type:** E2E **Priority:** P1

#### US-023
**Title:** The site works on a slow or flaky connection
**As a:** founder on hotel Wi-Fi or a 3G connection while travelling
**I want:** the pitch to appear quickly and nothing to break when the network misbehaves
**So that:** I don't give up before reading why Techdome is different
**Acceptance:**
- [x] Homepage total transfer < 3 MB (JS weight recorded for the report, not gated)
- [x] Hashed static assets cached `immutable` for a year
- [ ] Optimised images cached ≥ 1 day → **fails, BUG-012** (`max-age=60`)
- [x] With Chromium "Fast 3G" throttling (1.44 Mbps / 562 ms RTT), the hero `<h1>` is visible in < 10 s
- [x] Going offline mid-session fails cleanly (browser error), not a half-rendered shell
**Test Type:** Integration **Priority:** P2

---

## Backlog: stories identified but not automated (and why)

| ID | Story | Why not automated (yet) |
|---|---|---|
| US-024 | Candidate searches open roles on `/careers` ("Search roles, tech, or skills") | Time-boxed. Next on the list, since it's the only client-side search on the site. |
| US-025 | Buyer filters case studies on `/work` by category (New Product / Team Extension / AI & Automation tabs) | Time-boxed. The tab buttons exist; filtering logic is worth a test. |
| US-026 | Complete a Calendly booking end-to-end | Would create real meetings on a real person's calendar. Needs a Calendly sandbox event. |
| US-027 | Real (unmocked) newsletter subscription + double-opt-in email | Needs a Techdome-provided test inbox / staging env. Mocking covers the UI contract. |
| US-028 | Server-side injection/XSS against `/api/*` | Deliberately not done against production without written authorization from the owner. |
| US-029 | Cross-browser run on every commit | Built but opt-in: `npm run test:cross-browser` runs the phone-persona specs on real WebKit (iPhone 13). Off by default so a fresh clone needs only Chromium. |
| US-030 | Visual regression (screenshot diffs) | Live marketing content (count-up animations, rotating case studies) makes pixel diffs flaky without a frozen staging build. Layout is covered by the overflow and viewport assertions instead. |

## Coverage summary

| Area | Required min. stories | Stories | Automated tests |
|---|---|---|---|
| Navigation & page load | 2 | US-001, US-002 | 38 |
| Contact / enquiry form | 2 | US-003, US-004, US-005 | 17 |
| CTAs & external links | 2 | US-006, US-007, US-008 | 13 |
| Mobile responsiveness | 2 | US-009, US-010 | 38 |
| Performance / health / chat / SEO / a11y (extra) | — | US-011, US-012, US-013, US-021, US-022 | 32 |
| API / form integration | 3 | US-014, US-015, US-016, US-023 | 19 |
| Security headers & injection | 2 | US-017, US-018, US-019 | 32 |
| Load (≤ 5 users) | 1 | US-020 | 1 |
| **Total** | **14** | **23 automated + 7 backlog** | **190** (e2e 138 · integration 19 · security 32 · load 1) |

The live pass/fail status of every story is in [`traceability.md`](traceability.md), generated from the latest full run.
