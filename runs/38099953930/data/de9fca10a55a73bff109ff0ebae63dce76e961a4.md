# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/navigation.spec.ts >> Navigation & page load @US-002 >> /faq returns 200 with a real title and content
- Location: tests/e2e/navigation.spec.ts:7:9

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Frequently Asked Questions/
Received string:  "FAQ: Choosing a Software Development Partner | Techdome"
Timeout: 10000ms

Call log:
  - Expect "toHaveTitle" with timeout 10000ms
    21 × locator resolved to <html lang="en" class="__variable_d8ebd1 __variable_231f96">…</html>
       - unexpected value "FAQ: Choosing a Software Development Partner | Techdome"

```

```yaml
- banner:
  - link "Techdome Venture Studio — home":
    - /url: /
    - img "Techdome"
    - text: Venture Studio
  - navigation "Primary":
    - button "Services"
    - button "Portfolio"
    - button "Insights"
    - button "Company"
  - link "Contact Us":
    - /url: /contact
- main:
  - text: Frequently asked
  - heading "Straight answers, before you engage." [level=1]
  - paragraph: Every question a founder or engineering lead asks before signing a Statement of Work — on positioning, pricing, staffing, IP and automation. No sales call required to get these.
  - text: The studio model
  - heading "How Techdome works." [level=2]
  - paragraph: Positioning, anonymization, pricing, IP and the discovery call.
  - heading "How does Techdome differ from a traditional software dev agency?" [level=3]:
    - button "How does Techdome differ from a traditional software dev agency?" [expanded]
  - region:
    - paragraph: Traditional dev agencies forward resumes or build generic spec work without skin in the game. Techdome is a venture studio. We fund and build our own software ventures (Sparrow, JustInterview.ai, Aether Voice, ARC) using the exact same engineering pods and Blueprint we deploy for client ventures. We co-own technical risk and build for long-term production survival.
  - heading "Why are client projects anonymized on your website?" [level=3]:
    - button "Why are client projects anonymized on your website?"
  - heading "How quickly can a Dedicated Engineering Pod start working?" [level=3]:
    - button "How quickly can a Dedicated Engineering Pod start working?"
  - heading "What engagement models and pricing structures do you offer?" [level=3]:
    - button "What engagement models and pricing structures do you offer?"
  - heading "How do you handle intellectual property (IP) and data compliance?" [level=3]:
    - button "How do you handle intellectual property (IP) and data compliance?"
  - heading "What happens during the 30-minute architecture scoping call?" [level=3]:
    - button "What happens during the 30-minute architecture scoping call?"
  - heading "How to choose a custom software development partner for startups?" [level=3]:
    - button "How to choose a custom software development partner for startups?"
  - text: Choosing a partner
  - heading "Evaluating a development partner." [level=2]
  - paragraph: Cost, timelines, red flags, and in-house vs. outsourced.
  - heading "How do I choose the right custom software development partner?" [level=3]:
    - button "How do I choose the right custom software development partner?" [expanded]
  - region:
    - paragraph: Evaluate whether the partner has verifiable skin in the game (building and shipping their own software products, not just billing client hours), verifiable third-party metrics ($300K+ / 100% Job Success on Upwork), transparent milestone-based pricing without rate cards, and direct communication with principal architects rather than non-technical account managers.
  - heading "How much does it cost to outsource software development or build an MVP?" [level=3]:
    - button "How much does it cost to outsource software development or build an MVP?"
  - 'heading "In-house vs. outsourced software development: what is the right choice?" [level=3]':
    - 'button "In-house vs. outsourced software development: what is the right choice?"'
  - heading "What is the difference between IT staff augmentation and project outsourcing?" [level=3]:
    - button "What is the difference between IT staff augmentation and project outsourcing?"
  - heading "What are the red flags to watch for when hiring a software development agency?" [level=3]:
    - button "What are the red flags to watch for when hiring a software development agency?"
  - heading "How long does it take to build an MVP from scratch?" [level=3]:
    - button "How long does it take to build an MVP from scratch?"
  - text: Venture studio
  - heading "Building an MVP with Techdome." [level=2]
  - paragraph: The Blueprint, pricing, and the technical co-founder alternative.
  - heading "How long does it take to build an MVP with Techdome?" [level=3]:
    - button "How long does it take to build an MVP with Techdome?" [expanded]
  - region:
    - paragraph: A full 0-to-1 build runs on our 5-step Blueprint and typically reaches production in about eight weeks — architecture and compliance in Week 1, through to DNS cutover and telemetry at launch. A Fixed-Scope Sprint against a narrower brief is 2–4 weeks. Either way, every stage carries a locked deliverable and a stated window before work starts.
  - heading "How much does MVP development cost for startups?" [level=3]:
    - button "How much does MVP development cost for startups?"
  - heading "How does Techdome act as a technical cofounder alternative?" [level=3]:
    - button "How does Techdome act as a technical cofounder alternative?"
  - heading "What compliance standards are built in from Day Zero?" [level=3]:
    - button "What compliance standards are built in from Day Zero?"
  - heading "Who owns the code repository and intellectual property?" [level=3]:
    - button "Who owns the code repository and intellectual property?"
  - heading "What does an MVP development company actually build?" [level=3]:
    - button "What does an MVP development company actually build?"
  - heading "Do you offer fractional CTO services?" [level=3]:
    - button "Do you offer fractional CTO services?"
  - heading "Are you a startup app development company or an agency for larger teams?" [level=3]:
    - button "Are you a startup app development company or an agency for larger teams?"
  - text: Staff augmentation
  - heading "Hiring dedicated engineers." [level=2]
  - paragraph: Vetting, stacks, timezone overlap, and the replacement guarantee.
  - heading "What is the difference between IT staff augmentation and outsourcing?" [level=3]:
    - button "What is the difference between IT staff augmentation and outsourcing?" [expanded]
  - region:
    - paragraph: In traditional project outsourcing, you hand off specifications to an external agency with little visibility into day-to-day code. In staff augmentation, dedicated senior engineers (React, Node.js, Python, DevOps) embed directly into your Slack, Git repos, and daily standups under your technical leadership with 100% IP handover.
  - heading "What developer roles and technology stacks can I hire?" [level=3]:
    - button "What developer roles and technology stacks can I hire?"
  - heading "How do you screen and vet software engineers?" [level=3]:
    - button "How do you screen and vet software engineers?"
  - heading "How quickly can a dedicated developer or engineering pod start?" [level=3]:
    - button "How quickly can a dedicated developer or engineering pod start?"
  - heading "What timezone overlap do you guarantee for US and European clients?" [level=3]:
    - button "What timezone overlap do you guarantee for US and European clients?"
  - heading "What is the 14-day zero-risk replacement guarantee?" [level=3]:
    - button "What is the 14-day zero-risk replacement guarantee?"
  - heading "How do I hire a full stack developer, React developers or Node.js developers?" [level=3]:
    - button "How do I hire a full stack developer, React developers or Node.js developers?"
  - heading "What is an offshore development center in India, and how does it work with you?" [level=3]:
    - button "What is an offshore development center in India, and how does it work with you?"
  - heading "Can I hire remote software developers for the long term?" [level=3]:
    - button "Can I hire remote software developers for the long term?"
  - heading "Is my code and IP protected when I hire dedicated developers?" [level=3]:
    - button "Is my code and IP protected when I hire dedicated developers?"
  - heading "How do you compare with other offshore development centers in India?" [level=3]:
    - button "How do you compare with other offshore development centers in India?"
  - heading "Can I hire dedicated developers in India and still work in my time zone?" [level=3]:
    - button "Can I hire dedicated developers in India and still work in my time zone?"
  - heading "What should I check when hiring ReactJS developers?" [level=3]:
    - button "What should I check when hiring ReactJS developers?"
  - heading "How can I see how a team worked on a past engagement?" [level=3]:
    - button "How can I see how a team worked on a past engagement?"
  - text: n8n & AI automation
  - heading "Automating with n8n." [level=2]
  - paragraph: Self-hosted vs. Zapier/Make, GraphRAG, and delivery timelines.
  - heading "Why choose an n8n automation agency over traditional SaaS integration tools?" [level=3]:
    - button "Why choose an n8n automation agency over traditional SaaS integration tools?" [expanded]
  - region:
    - paragraph: Tools like Zapier or Make charge per task, so the bill grows with your volume. An n8n automation agency like Techdome deploys n8n inside your own private VPC, so you pay a flat server cost however many triggers and webhooks you run. Your customer data also stays inside your own environment, which makes HIPAA and SOC 2 reviews simpler.
  - heading "How do I hire an n8n developer or a dedicated engineering pod?" [level=3]:
    - button "How do I hire an n8n developer or a dedicated engineering pod?"
  - heading "What is included in Techdome’s self-hosted n8n Docker Kubernetes deployment?" [level=3]:
    - button "What is included in Techdome’s self-hosted n8n Docker Kubernetes deployment?"
  - heading "How does Techdome deliver AI voice agent development and custom AI agents?" [level=3]:
    - button "How does Techdome deliver AI voice agent development and custom AI agents?"
  - heading "What is GraphRAG implementation and why is it superior to standard RAG?" [level=3]:
    - button "What is GraphRAG implementation and why is it superior to standard RAG?"
  - heading "What do Techdome’s n8n consulting services and workflow automation consulting entail?" [level=3]:
    - button "What do Techdome’s n8n consulting services and workflow automation consulting entail?"
  - heading "What business process automation services does Techdome specialize in?" [level=3]:
    - button "What business process automation services does Techdome specialize in?"
  - heading "How does Techdome prevent data loss when a third-party API goes down?" [level=3]:
    - button "How does Techdome prevent data loss when a third-party API goes down?"
  - heading "What are n8n custom nodes and when do you need them?" [level=3]:
    - button "What are n8n custom nodes and when do you need them?"
  - heading "How is Techdome different from other AI agent development companies?" [level=3]:
    - button "How is Techdome different from other AI agent development companies?"
  - heading "How much does an AI solution cost?" [level=3]:
    - button "How much does an AI solution cost?"
  - heading "Do you build machine learning and deep learning models?" [level=3]:
    - button "Do you build machine learning and deep learning models?"
- contentinfo:
  - heading "Subscribe to our newsletter" [level=3]
  - paragraph: Bi-weekly architectural breakdowns, system design notes and engineering insights.
  - textbox "Enter your work email"
  - button "Subscribe"
  - text: Every other Monday. Unsubscribe anytime.
  - link "Techdome — home":
    - /url: /
    - img "Techdome"
    - text: Product Venture Studio
  - paragraph: "We build software ventures two ways: our own products, and yours. Senior engineering pods, a proven blueprint, and production AI automation."
  - link "Book a 30-minute scoping call":
    - /url: /contact
  - link "WhatsApp":
    - /url: https://wa.me/918374004859?text=Hi%20Techdome%2C%20I%20would%20like%20to%20schedule%20an%20architecture%20consultation.
  - link "+91 83740 04859":
    - /url: tel:+918374004859
  - link "Upwork $300K+ · 100% Upwork":
    - /url: https://www.upwork.com/agencies/techdome
    - img "Upwork"
    - text: $300K+ · 100% Upwork
  - link "Clutch Clutch":
    - /url: https://clutch.co/profile/techdome
    - img "Clutch"
    - text: Clutch
  - link "Techdome on LinkedIn":
    - /url: https://www.linkedin.com/company/techdome-solutions
    - img "LinkedIn"
  - link "Techdome on X":
    - /url: https://x.com/techdomesolves
    - img "X (Twitter)"
  - link "Techdome on Instagram":
    - /url: https://www.instagram.com/techdome.io/
    - img "Instagram"
  - link "Techdome on GitHub":
    - /url: https://github.com/techdome-io
    - img "GitHub"
  - link "Techdome on Facebook":
    - /url: https://www.facebook.com/techdomesolutions
    - img "Facebook"
  - navigation "Services":
    - heading "Services" [level=2]:
      - link "Services":
        - /url: /services
    - list:
      - listitem:
        - link "Venture Studio":
          - /url: /studio
      - listitem:
        - link "MVP development":
          - /url: /studio#mvp
      - listitem:
        - link "Staff Augmentation":
          - /url: /staff-augmentation
      - listitem:
        - link "Hire React developers":
          - /url: /staff-augmentation#role-react-nextjs
      - listitem:
        - link "Hire Node.js developers":
          - /url: /staff-augmentation#role-nodejs-backend
      - listitem:
        - link "n8n & AI Automation Moat":
          - /url: /automation
      - listitem:
        - link "AI voice agents":
          - /url: /automation#ai-voice-agents
  - navigation "Industries":
    - heading "Industries" [level=2]:
      - link "Industries":
        - /url: /work
    - list:
      - listitem:
        - link "Healthcare":
          - /url: /work?domain=Healthcare#case-studies
      - listitem:
        - link "Enterprise & ERP":
          - /url: /work?domain=Enterprise%20%26%20ERP#case-studies
      - listitem:
        - link "AI & Automation":
          - /url: /work?domain=AI%20%26%20Automation#case-studies
      - listitem:
        - link "FinTech":
          - /url: /work?domain=FinTech#case-studies
      - listitem:
        - link "Consumer & Marketplace":
          - /url: /work?domain=Consumer%20%26%20Marketplace#case-studies
      - listitem:
        - link "Public Sector":
          - /url: /work?domain=Public%20Sector#case-studies
      - listitem:
        - link "Education":
          - /url: /work?domain=EdTech%20%26%20Education#case-studies
  - navigation "Products":
    - heading "Products" [level=2]:
      - link "Products":
        - /url: /products
    - list:
      - listitem:
        - 'link "Sparrow PH #4 ×2"':
          - /url: /products/sparrow
      - listitem:
        - link "JustInterview.ai":
          - /url: /products/justinterview-ai
      - listitem:
        - link "Saral Funding":
          - /url: /products/saral-funding
      - listitem:
        - link "Geolytics":
          - /url: /products/geolytics
      - listitem:
        - link "Aether Voice":
          - /url: /products/aether-voice
      - listitem:
        - link "Catalyst":
          - /url: /products/catalyst
      - listitem:
        - link "ARC Studio OS":
          - /url: /products/arc
  - navigation "Company":
    - heading "Company" [level=2]
    - list:
      - listitem:
        - link "About & entities":
          - /url: /about
      - listitem:
        - link "Portfolio":
          - /url: /work
      - listitem:
        - link "Engineering insights":
          - /url: /insights
      - listitem:
        - link "Newsletter":
          - /url: /newsletter
      - listitem:
        - link "Life at Techdome":
          - /url: /life-at-techdome
      - listitem:
        - link "Careers Hiring":
          - /url: /careers
      - listitem:
        - link "FAQ":
          - /url: /faq
      - listitem:
        - link "Contact":
          - /url: /contact
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - button "Cookie settings"
  - link "Sitemap":
    - /url: /sitemap.xml
  - img "ISO Accredited"
  - text: ISO
  - img "HIPAA Compliant"
  - text: HIPAA
  - img "DPIIT Recognized": DPIIT GOVT. OF INDIA
  - text: DPIIT © Copyright 2026, All Rights Reserved by Techdome
- button "Open Pod chat"
- alert
- dialog "One engineering note, every other Monday.":
  - button "Close newsletter pop-up"
  - text: Techdome newsletter
  - heading "One engineering note, every other Monday." [level=2]
  - paragraph: Tell us who you are so the notes fit. I'm a…
  - button "Business Founder, operator or buyer"
  - button "Past client We have built something for you"
  - button "Student Learning n8n or AI automation"
```

# Test source

```ts
  1   | import { test, expect } from '../../utils/fixtures';
  2   | import { CORE_PAGES, knownBug, mapWithConcurrency, statusOf } from '../../utils/helpers';
  3   | import { BasePage } from '../../pages/BasePage';
  4   | 
  5   | test.describe('Navigation & page load @US-002', () => {
  6   |   for (const { path, titleIncludes } of CORE_PAGES) {
  7   |     test(`${path} returns 200 with a real title and content`, async ({ page }) => {
  8   |       const base = new BasePage(page);
  9   |       const response = await base.goto(path);
  10  |       expect(response?.status(), `${path} HTTP status`).toBe(200);
> 11  |       await expect(page).toHaveTitle(titleIncludes);
      |                          ^ Error: expect(page).toHaveTitle(expected) failed
  12  |       await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  13  |       // "Not a blank page": meaningful rendered text inside <main>.
  14  |       const text = await page.getByRole('main').innerText();
  15  |       expect(text.trim().length, `${path} main content length`).toBeGreaterThan(200);
  16  |     });
  17  |   }
  18  | 
  19  |   test('every internal link in header and footer resolves (no 4xx/5xx)', async ({ page, request }) => {
  20  |     const base = new BasePage(page);
  21  |     await base.goto('/');
  22  |     const hrefs = await page.locator('header a[href^="/"], footer a[href^="/"]').evaluateAll((as) =>
  23  |       Array.from(new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!.split('#')[0]))),
  24  |     );
  25  |     expect(hrefs.length).toBeGreaterThan(15);
  26  | 
  27  |     const results = await mapWithConcurrency(hrefs, 3, async (href) => ({ href, status: await statusOf(request, href) }));
  28  |     const broken = results.filter((r) => r.status >= 400);
  29  |     expect(broken, `Broken internal links: ${JSON.stringify(broken)}`).toEqual([]);
  30  |   });
  31  | 
  32  |   test('desktop "What we do" menu opens and routes to Staff Augmentation', async ({ page }) => {
  33  |     const base = new BasePage(page);
  34  |     await base.goto('/');
  35  |     const trigger = base.navMenuButton('What we do');
  36  |     await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  37  |     await trigger.click();
  38  |     await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  39  |     // Scoped to <header>: an unscoped locator once matched the footer link instead.
  40  |     await base.header.getByRole('link', { name: 'Staff Augmentation' }).click();
  41  |     await expect(page).toHaveURL(/\/staff-augmentation$/);
  42  |     await expect(page).toHaveTitle(/Staff Augmentation/);
  43  |   });
  44  | 
  45  |   test('"Services Overview" is reachable from the header menu', async ({ page }) => {
  46  |     knownBug('BUG-008', '/services is linked only from the footer, not from any header menu');
  47  |     const base = new BasePage(page);
  48  |     await base.goto('/');
  49  |     await base.navMenuButton('What we do').click();
  50  |     await expect(base.header.getByRole('link', { name: /Services/ })).toBeVisible({ timeout: 3000 });
  51  |   });
  52  | 
  53  |   test('trailing-slash URLs permanently redirect to the canonical path', async ({ request }) => {
  54  |     for (const [from, to] of [['/contact/', '/contact'], ['/products/sparrow/', '/products/sparrow']]) {
  55  |       const res = await request.get(from, { maxRedirects: 0, failOnStatusCode: false });
  56  |       expect([301, 308], from).toContain(res.status());
  57  |       expect(res.headers()['location']).toBe(to);
  58  |     }
  59  |   });
  60  | 
  61  |   test('campaign query strings do not break pages (ad / newsletter links)', async ({ page }) => {
  62  |     const res = await page.goto('/?utm_source=newsletter&utm_medium=email&utm_campaign=qa&fbclid=abc123');
  63  |     expect(res?.status()).toBe(200);
  64  |     await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your product team/);
  65  |     // Canonical must drop the tracking params, or every campaign URL becomes a duplicate page.
  66  |     await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/techdome\.io\/?$/);
  67  |   });
  68  | 
  69  |   test('browser Back and Forward restore the right pages', async ({ homePage, page }) => {
  70  |     await homePage.open();
  71  |     await homePage.seeWorkCta.click();
  72  |     await expect(page).toHaveURL(/\/work$/);
  73  |     await page.goBack();
  74  |     await expect(page).toHaveURL(/techdome\.io\/?$/);
  75  |     await expect(homePage.heroHeading).toBeVisible();
  76  |     await page.goForward();
  77  |     await expect(page).toHaveURL(/\/work$/);
  78  |     await expect(page).toHaveTitle(/Case Studies/);
  79  |   });
  80  | 
  81  |   test('keyboard focus is visible on the first focusable element', async ({ page }) => {
  82  |     await page.goto('/');
  83  |     await page.keyboard.press('Tab');
  84  |     const style = await page.evaluate(() => {
  85  |       const el = document.activeElement as HTMLElement;
  86  |       const cs = getComputedStyle(el);
  87  |       return { tag: el.tagName, outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth), shadow: cs.boxShadow };
  88  |     });
  89  |     expect(style.tag).not.toBe('BODY');
  90  |     expect(style.outline !== 'none' && style.width > 0 || style.shadow !== 'none', JSON.stringify(style)).toBe(true);
  91  |   });
  92  | 
  93  |   test('a "skip to content" link is the first Tab stop', async ({ page }) => {
  94  |     knownBug('BUG-013', 'No skip link — keyboard users tab through the whole header on every page');
  95  |     await page.goto('/');
  96  |     await page.keyboard.press('Tab');
  97  |     const focused = page.locator(':focus');
  98  |     await expect(focused).toHaveText(/skip/i);
  99  |     await expect(focused).toHaveAttribute('href', /^#/);
  100 |   });
  101 | 
  102 |   test('logo returns the user to the homepage from a deep page', async ({ page }) => {
  103 |     const base = new BasePage(page);
  104 |     await base.goto('/products/sparrow');
  105 |     await base.homeLink.click();
  106 |     await expect(page).toHaveURL(/techdome\.io\/?$/);
  107 |   });
  108 | 
  109 |   test('unknown URL returns a real 404 with a way back', async ({ page }) => {
  110 |     const base = new BasePage(page);
  111 |     const response = await base.goto('/this-page-does-not-exist-qa');
```