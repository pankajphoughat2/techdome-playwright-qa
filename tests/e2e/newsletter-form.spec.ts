import { test, expect } from '../../utils/fixtures';
import { SUBSCRIBE_ENDPOINT } from '../../pages/NewsletterPage';
import { knownBug } from '../../utils/helpers';

/**
 * The backend is mocked in every test here: a QA suite that runs on every
 * commit must not create real subscribers (or trigger real welcome emails)
 * on a production mailing list. The contract we mock was confirmed against
 * the live API with invalid-only payloads — see docs/claude-code-log.md.
 */
test.describe('Newsletter enquiry form @US-004 @US-005', () => {
  test('valid email submits and shows the success confirmation', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) =>
      route.fulfill({ status: 200, json: { success: true, message: 'You are subscribed. Watch your inbox.' } }),
    );
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');

    // The success box shows fixed copy and ignores the server's `message` (verified by
    // probing with a unique mocked message), and it replaces the form entirely.
    await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
    await expect(newsletterPage.emailInput).toHaveCount(0);
  });

  test('empty email is blocked by required-field validation — no request sent', async ({ newsletterPage, page }) => {
    let requests = 0;
    await page.route(SUBSCRIBE_ENDPOINT, (route) => { requests++; return route.abort(); });
    await newsletterPage.open();
    await newsletterPage.subscribeButton.click();

    expect(await newsletterPage.validationMessage()).not.toBe('');
    await expect(newsletterPage.emailInput).toHaveJSProperty('validity.valueMissing', true);
    expect(requests).toBe(0);
  });

  for (const bad of ['plainaddress', 'missing-at.example.com', '@no-local-part.com', 'spaces in@example.com']) {
    test(`malformed email "${bad}" is rejected client-side`, async ({ newsletterPage, page }) => {
      let requests = 0;
      await page.route(SUBSCRIBE_ENDPOINT, (route) => { requests++; return route.abort(); });
      await newsletterPage.open();
      await newsletterPage.subscribe(bad);

      await expect(newsletterPage.emailInput).toHaveJSProperty('validity.valid', false);
      expect(requests).toBe(0);
    });
  }

  test('server-side rejection is surfaced to the user', async ({ newsletterPage, page }) => {
    // "user@localhost" passes both native type=email and the site's `includes("@")` check,
    // so it reaches the server — this exercises the server-error path in the UI.
    await page.route(SUBSCRIBE_ENDPOINT, (route) =>
      route.fulfill({ status: 400, json: { success: false, message: 'Please enter a valid email address.' } }),
    );
    await newsletterPage.open();
    await newsletterPage.subscribe('user@localhost');
    await expect(newsletterPage.statusMessage('Please enter a valid email address.')).toBeVisible();
    await expect(newsletterPage.emailInput).toHaveValue('user@localhost');
  });

  test('network failure shows a recoverable error', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) => route.abort('internetdisconnected'));
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');
    await expect(newsletterPage.statusMessage(/Network error/)).toBeVisible();
    await expect(newsletterPage.subscribeButton).toBeEnabled();
  });

  test('double-clicking Subscribe sends only one request', async ({ newsletterPage, page }) => {
    let requests = 0;
    await page.route(SUBSCRIBE_ENDPOINT, async (route) => {
      requests++;
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({ status: 200, json: { success: true, message: 'Subscribed.' } });
    });
    await newsletterPage.open();
    await newsletterPage.emailInput.fill('qa.candidate@example.com');
    await newsletterPage.subscribeButton.dblclick();
    await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
    expect(requests).toBe(1);
  });

  test('pressing Enter in the email field submits (keyboard-only user)', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) => route.fulfill({ status: 200, json: { success: true, message: 'ok' } }));
    await newsletterPage.open();
    await newsletterPage.emailInput.fill('qa.candidate@example.com');
    const [request] = await Promise.all([page.waitForRequest(SUBSCRIBE_ENDPOINT), newsletterPage.emailInput.press('Enter')]);
    expect(request.method()).toBe('POST');
    await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
  });

  test('button is disabled while the request is in flight', async ({ newsletterPage, page }) => {
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    await page.route(SUBSCRIBE_ENDPOINT, async (route) => { await held; await route.fulfill({ status: 200, json: { success: true } }); });
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');
    await expect(newsletterPage.form.getByRole('button')).toBeDisabled();
    await expect(newsletterPage.emailInput).toBeDisabled();
    release();
    await expect(newsletterPage.statusMessage('Thank you for subscribing.')).toBeVisible();
  });

  test('rate limiting (429) is explained to the user', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) =>
      route.fulfill({ status: 429, json: { success: false, message: 'Too many attempts. Please try again in a minute.' } }),
    );
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');
    await expect(newsletterPage.statusMessage('Too many attempts. Please try again in a minute.')).toBeVisible();
    await expect(newsletterPage.emailInput).toHaveValue('qa.candidate@example.com'); // no retyping needed
  });

  test('a server outage (500, HTML body) is not blamed on the user\'s connection', async ({ newsletterPage, page }) => {
    knownBug('BUG-009', 'Any non-JSON server error is reported as "Network error. Please verify your connection."');
    // Realistic outage: a proxy/CDN error page, not JSON. res.json() throws → the catch-all
    // branch tells the visitor to check THEIR connection.
    await page.route(SUBSCRIBE_ENDPOINT, (route) =>
      route.fulfill({ status: 500, contentType: 'text/html', body: '<html><body>502 Bad Gateway</body></html>' }),
    );
    await newsletterPage.open();
    await newsletterPage.subscribe('qa.candidate@example.com');
    await expect(newsletterPage.statusMessage(/Network error|Unable to subscribe|try again/i)).toBeVisible();
    await expect(newsletterPage.statusMessage(/verify your connection/i)).toHaveCount(0);
  });

  test('email input has an accessible name', async ({ newsletterPage }) => {
    knownBug('BUG-003', 'Newsletter email input has no label / aria-label');
    await newsletterPage.open();
    // Placeholder text is not a reliable accessible name (disappears on input, low contrast).
    const name = await newsletterPage.emailInput.evaluate((el: HTMLInputElement) =>
      el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || '',
    );
    expect(name, 'label / aria-label / aria-labelledby on the email field').not.toBe('');
  });

  test('email input supports browser autofill', async ({ newsletterPage }) => {
    knownBug('BUG-003', 'No name / autocomplete="email" on the newsletter input');
    await newsletterPage.open();
    // Without autocomplete="email" mobile keyboards & password managers can't offer the address.
    await expect(newsletterPage.emailInput).toHaveAttribute('autocomplete', /email/);
  });
});
