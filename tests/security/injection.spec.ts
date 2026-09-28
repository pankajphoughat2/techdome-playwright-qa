import { test, expect } from '../../utils/fixtures';
import { SUBSCRIBE_ENDPOINT } from '../../pages/NewsletterPage';
import { CHAT_ENDPOINT } from '../../pages/ChatWidget';

/**
 * Script-injection checks.
 *
 * Deliberate scoping decision: payloads are exercised against the browser UI
 * with the backend MOCKED. We never send XSS payloads to Techdome's live API —
 * that would be unsolicited attack traffic against a third party's production
 * system, and could land a stored-XSS string in a real CRM/mailing list.
 * Server-side validation was checked separately with invalid-but-benign input
 * (see tests/integration/api-status.spec.ts).
 *
 * Note: the brief says "name field", but techdome.io has no form with a name
 * field. The two free-text inputs that exist are the newsletter email field and
 * the Pod chat box, so those are tested instead.
 */
const PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "<svg/onload=alert('xss')>",
  'javascript:alert(1)',
];

test.describe('Script injection @US-018', () => {
  let dialogs: string[];

  test.beforeEach(async ({ page }) => {
    dialogs = [];
    // Any dialog at all means a payload executed. (Throwing inside the listener
    // would not fail the test reliably, so collect and assert in afterEach.)
    page.on('dialog', async (d) => {
      dialogs.push(`${d.type()}: ${d.message()}`);
      await d.dismiss();
    });
    await page.addInitScript(() => { (window as any).__xss = 0; });
  });

  test.afterEach(() => {
    expect(dialogs, 'JavaScript dialogs fired — injected script executed').toEqual([]);
  });

  for (const payload of PAYLOADS) {
    test(`newsletter email field rejects ${JSON.stringify(payload)} before it leaves the browser`, async ({ newsletterPage, page }) => {
      const sent: string[] = [];
      await page.route(SUBSCRIBE_ENDPOINT, (route) => { sent.push(route.request().postData() ?? ''); return route.fulfill({ status: 400, json: { success: false, message: 'x' } }); });
      await newsletterPage.open();
      await newsletterPage.subscribe(payload);
      await expect(newsletterPage.emailInput).toHaveJSProperty('validity.valid', false);
      expect(sent, 'payload should be blocked client-side').toEqual([]);
    });
  }

  test('server error messages are rendered as text, not HTML', async ({ newsletterPage, page }) => {
    // Simulates a backend that (wrongly) echoes input back in its error message.
    const evil = '<img src=x onerror="window.__xss=1"><b id="injected">bold</b>';
    await page.route(SUBSCRIBE_ENDPOINT, (route) => route.fulfill({ status: 400, json: { success: false, message: evil } }));
    await newsletterPage.open();
    await newsletterPage.subscribe('user@localhost');

    await expect(page.getByRole('main').getByText(evil)).toBeVisible(); // shown literally
    await expect(page.locator('#injected')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBe(0);
  });

  test('chat renders a script payload typed by the user as inert text', async ({ homePage, chat, page }) => {
    await page.route(CHAT_ENDPOINT, (route) => route.fulfill({ status: 500, json: { error: 'mocked' } }));
    await homePage.open();
    await chat.open();
    const payload = '<img src=x onerror="window.__xss=1" id="chat-injected">';
    await chat.send(payload);

    await expect(chat.dialog.getByText(payload)).toBeVisible();
    await expect(page.locator('#chat-injected')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBe(0);
  });

  test('chat does not render executable HTML or javascript: links from the assistant response', async ({ homePage, chat, page }) => {
    // The assistant output is LLM-generated and therefore attacker-influenced (prompt injection).
    // Response contract is JSON { reply } — verified by probing the client with mocked variants.
    const evil = 'Sure-thing-marker <img src=x onerror="window.__xss=1" id="bot-injected"> [click me](javascript:window.__xss=2)';
    await page.route(CHAT_ENDPOINT, (route) => route.fulfill({ status: 200, json: { reply: evil } }));
    await homePage.open();
    await chat.open();
    await chat.send('hello');

    // Guard against a vacuous pass: the reply must actually have been rendered.
    await expect(chat.dialog.getByText(/Sure-thing-marker/)).toBeVisible();
    await expect(page.locator('#bot-injected')).toHaveCount(0);
    await expect(chat.dialog.locator('a[href^="javascript:" i]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBe(0);
  });
});
