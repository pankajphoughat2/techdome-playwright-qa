# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/newsletter-form.spec.ts >> Newsletter enquiry form @US-004 @US-005 >> email input supports browser autofill
- Location: tests/e2e/newsletter-form.spec.ts:136:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByRole('main').locator('form').filter({ has: locator('input[type="email"]') }).first().getByPlaceholder('Enter your email')
Expected pattern: /email/
Received string:  ""
Timeout: 10000ms

Call log:
  - Expect "toHaveAttribute" getByRole('main').locator('form').filter({ has: locator('input[type="email"]') }).first().getByPlaceholder('Enter your email') with timeout 10000ms
  - waiting for getByRole('main').locator('form').filter({ has: locator('input[type="email"]') }).first().getByPlaceholder('Enter your email')
    23 × locator resolved to <input value="" required="" type="email" placeholder="Enter your email" class="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-0 focus:outline-none disabled:opacity-50 text-ink placeholder:text-ink-3 font-sans"/>
       - unexpected value "null"

```

```yaml
- textbox "Enter your email"
```

# Test source

```ts
  40  |       await newsletterPage.open();
  41  |       await newsletterPage.subscribe(bad);
  42  | 
  43  |       await expect(newsletterPage.emailInput).toHaveJSProperty('validity.valid', false);
  44  |       expect(requests).toBe(0);
  45  |     });
  46  |   }
  47  | 
  48  |   test('server-side rejection is surfaced to the user', async ({ newsletterPage, page }) => {
  49  |     // "user@localhost" passes both native type=email and the site's `includes("@")` check,
  50  |     // so it reaches the server — this exercises the server-error path in the UI.
  51  |     await page.route(SUBSCRIBE_ENDPOINT, (route) =>
  52  |       route.fulfill({ status: 400, json: { success: false, message: 'Please enter a valid email address.' } }),
  53  |     );
  54  |     await newsletterPage.open();
  55  |     await newsletterPage.subscribe('user@localhost');
  56  |     await expect(newsletterPage.statusMessage('Please enter a valid email address.')).toBeVisible();
  57  |     await expect(newsletterPage.emailInput).toHaveValue('user@localhost');
  58  |   });
  59  | 
  60  |   test('network failure shows a recoverable error', async ({ newsletterPage, page }) => {
  61  |     await page.route(SUBSCRIBE_ENDPOINT, (route) => route.abort('internetdisconnected'));
  62  |     await newsletterPage.open();
  63  |     await newsletterPage.subscribe('qa.candidate@example.com');
  64  |     await expect(newsletterPage.statusMessage(/Network error/)).toBeVisible();
  65  |     await expect(newsletterPage.subscribeButton).toBeEnabled();
  66  |   });
  67  | 
  68  |   test('double-clicking Subscribe sends only one request', async ({ newsletterPage, page }) => {
  69  |     let requests = 0;
  70  |     await page.route(SUBSCRIBE_ENDPOINT, async (route) => {
  71  |       requests++;
  72  |       await new Promise((r) => setTimeout(r, 1500));
  73  |       await route.fulfill({ status: 200, json: { success: true, message: 'Subscribed.' } });
  74  |     });
  75  |     await newsletterPage.open();
  76  |     await newsletterPage.emailInput.fill('qa.candidate@example.com');
  77  |     await newsletterPage.subscribeButton.dblclick();
  78  |     await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
  79  |     expect(requests).toBe(1);
  80  |   });
  81  | 
  82  |   test('pressing Enter in the email field submits (keyboard-only user)', async ({ newsletterPage, page }) => {
  83  |     await page.route(SUBSCRIBE_ENDPOINT, (route) => route.fulfill({ status: 200, json: { success: true, message: 'ok' } }));
  84  |     await newsletterPage.open();
  85  |     await newsletterPage.emailInput.fill('qa.candidate@example.com');
  86  |     const [request] = await Promise.all([page.waitForRequest(SUBSCRIBE_ENDPOINT), newsletterPage.emailInput.press('Enter')]);
  87  |     expect(request.method()).toBe('POST');
  88  |     await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
  89  |   });
  90  | 
  91  |   test('button is disabled while the request is in flight', async ({ newsletterPage, page }) => {
  92  |     let release!: () => void;
  93  |     const held = new Promise<void>((r) => (release = r));
  94  |     await page.route(SUBSCRIBE_ENDPOINT, async (route) => { await held; await route.fulfill({ status: 200, json: { success: true } }); });
  95  |     await newsletterPage.open();
  96  |     await newsletterPage.subscribe('qa.candidate@example.com');
  97  |     await expect(newsletterPage.form.getByRole('button')).toBeDisabled();
  98  |     await expect(newsletterPage.emailInput).toBeDisabled();
  99  |     release();
  100 |     await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
  101 |   });
  102 | 
  103 |   test('rate limiting (429) is explained to the user', async ({ newsletterPage, page }) => {
  104 |     await page.route(SUBSCRIBE_ENDPOINT, (route) =>
  105 |       route.fulfill({ status: 429, json: { success: false, message: 'Too many attempts. Please try again in a minute.' } }),
  106 |     );
  107 |     await newsletterPage.open();
  108 |     await newsletterPage.subscribe('qa.candidate@example.com');
  109 |     await expect(newsletterPage.statusMessage('Too many attempts. Please try again in a minute.')).toBeVisible();
  110 |     await expect(newsletterPage.emailInput).toHaveValue('qa.candidate@example.com'); // no retyping needed
  111 |   });
  112 | 
  113 |   test('a server outage (500, HTML body) is not blamed on the user\'s connection', async ({ newsletterPage, page }) => {
  114 |     knownBug('BUG-009', 'Any non-JSON server error is reported as "Network error. Please verify your connection."');
  115 |     // Realistic outage: a proxy/CDN error page, not JSON. res.json() throws → the catch-all
  116 |     // branch tells the visitor to check THEIR connection.
  117 |     await page.route(SUBSCRIBE_ENDPOINT, (route) =>
  118 |       route.fulfill({ status: 500, contentType: 'text/html', body: '<html><body>502 Bad Gateway</body></html>' }),
  119 |     );
  120 |     await newsletterPage.open();
  121 |     await newsletterPage.subscribe('qa.candidate@example.com');
  122 |     await expect(newsletterPage.statusMessage(/Network error|Unable to subscribe|try again/i)).toBeVisible();
  123 |     await expect(newsletterPage.statusMessage(/verify your connection/i)).toHaveCount(0);
  124 |   });
  125 | 
  126 |   test('email input has an accessible name', async ({ newsletterPage }) => {
  127 |     knownBug('BUG-003', 'Newsletter email input has no label / aria-label');
  128 |     await newsletterPage.open();
  129 |     // Placeholder text is not a reliable accessible name (disappears on input, low contrast).
  130 |     const name = await newsletterPage.emailInput.evaluate((el: HTMLInputElement) =>
  131 |       el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '',
  132 |     );
  133 |     expect(name, 'label / aria-label / aria-labelledby on the email field').not.toBe('');
  134 |   });
  135 | 
  136 |   test('email input supports browser autofill', async ({ newsletterPage }) => {
  137 |     knownBug('BUG-003', 'No name / autocomplete="email" on the newsletter input');
  138 |     await newsletterPage.open();
  139 |     // Without autocomplete="email" mobile keyboards & password managers can't offer the address.
> 140 |     await expect(newsletterPage.emailInput).toHaveAttribute('autocomplete', /email/);
      |                                             ^ Error: expect(locator).toHaveAttribute(expected) failed
  141 |   });
  142 | });
  143 | 
```