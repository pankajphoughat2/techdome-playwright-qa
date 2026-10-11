# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/navigation.spec.ts >> Navigation & page load @US-002 >> 404 page has its own title (not the homepage title)
- Location: tests/e2e/navigation.spec.ts:116:7

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /not found|404/i
Received string:  "Techdome: Custom Software Development & Venture Studio"
Timeout: 10000ms

Call log:
  - Expect "toHaveTitle" with timeout 10000ms
    23 × locator resolved to <html lang="en" class="__variable_d8ebd1 __variable_231f96">…</html>
       - unexpected value "Techdome: Custom Software Development & Venture Studio"

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
  - text: 404 · Page not found
  - heading "This record does not exist in the register." [level=1]
  - paragraph: The link you followed may have moved or been retired. Explore our primary practice areas and active portfolio ventures below.
  - link "Venture Studio 0 to 1 in 8 weeks on our Blueprint":
    - /url: /studio
  - link "Staff Augmentation Dedicated pods embedded in 2 weeks":
    - /url: /staff-augmentation
  - link "n8n & AI Automation Self-hosted production clusters & GraphRAG":
    - /url: /automation
  - link "Case Studies & Work Verified clinical, AI & ERP outcomes":
    - /url: /work
  - link "Return to homepage":
    - /url: /
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
  112 |     expect(response?.status()).toBe(404);
  113 |     await expect(base.homeLink).toBeVisible();
  114 |   });
  115 | 
  116 |   test('404 page has its own title (not the homepage title)', async ({ page }) => {
  117 |     knownBug('BUG-005', '404 page reuses the homepage <title>');
  118 |     const base = new BasePage(page);
  119 |     await base.goto('/this-page-does-not-exist-qa');
  120 |     await expect(page).not.toHaveTitle('Techdome — Custom Software Development Company & Venture Studio');
> 121 |     await expect(page).toHaveTitle(/not found|404/i);
      |                        ^ Error: expect(page).toHaveTitle(expected) failed
  122 |   });
  123 | 
  124 |   test('product page titles are not truncated with a literal ellipsis', async ({ page }) => {
  125 |     knownBug('BUG-004', 'Product <title>s are hard-truncated with "..." mid-phrase');
  126 |     const base = new BasePage(page);
  127 |     const truncated: string[] = [];
  128 |     for (const path of ['/products/sparrow', '/products/justinterview-ai', '/products/saral-funding', '/products/geolytics']) {
  129 |       await base.goto(path);
  130 |       const title = await page.title();
  131 |       if (title.includes('...')) truncated.push(`${path}: "${title}"`);
  132 |     }
  133 |     expect(truncated, truncated.join('\n')).toEqual([]);
  134 |   });
  135 | });
  136 | 
```