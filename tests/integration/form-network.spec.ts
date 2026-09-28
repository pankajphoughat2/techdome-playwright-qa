import { test, expect } from '../../utils/fixtures';
import { SUBSCRIBE_ENDPOINT } from '../../pages/NewsletterPage';
import { CHAT_ENDPOINT } from '../../pages/ChatWidget';

test.describe('Form → network integration @US-014', () => {
  test('newsletter submit sends POST /api/newsletter/subscribe with the expected JSON payload', async ({ newsletterPage, page }) => {
    await page.route(SUBSCRIBE_ENDPOINT, (route) => route.fulfill({ status: 200, json: { success: true, message: 'ok' } }));
    await newsletterPage.open();

    const [request] = await Promise.all([
      page.waitForRequest(SUBSCRIBE_ENDPOINT),
      newsletterPage.subscribe('  qa.candidate@example.com  '),
    ]);

    expect(request.method()).toBe('POST');
    expect(new URL(request.url()).pathname).toBe('/api/newsletter/subscribe');
    expect(request.headers()['content-type']).toContain('application/json');

    const body = request.postDataJSON();
    expect(Object.keys(body).sort()).toEqual(['email', 'utmMedium', 'utmSource']);
    expect(body).toEqual({
      email: 'qa.candidate@example.com', // client trims whitespace before sending
      utmSource: 'newsletter_page',
      utmMedium: 'form_submission',
    });
  });

  test('footer newsletter form on other pages tags a different utmSource', async ({ page }) => {
    // Same component is reused site-wide; attribution only works if each placement reports its own source.
    await page.route(SUBSCRIBE_ENDPOINT, (route) => route.fulfill({ status: 200, json: { success: true, message: 'ok' } }));
    await page.goto('/careers');
    const form = page.locator('form').filter({ has: page.locator('input[type="email"]') }).last();
    await form.scrollIntoViewIfNeeded();
    const [request] = await Promise.all([
      page.waitForRequest(SUBSCRIBE_ENDPOINT),
      (async () => {
        await form.getByPlaceholder('Enter your email').fill('qa.candidate@example.com');
        await form.getByRole('button').last().click();
      })(),
    ]);
    const { utmSource } = request.postDataJSON();
    expect(utmSource).toBeTruthy();
    expect(utmSource).not.toBe('newsletter_page');
  });

  test('chat message sends POST /api/chat with {message, history}', async ({ homePage, chat, page }) => {
    // Mocked: every real call hits an LLM on Techdome's bill.
    await page.route(CHAT_ENDPOINT, (route) => route.fulfill({ status: 500, json: { error: 'Pod is temporarily unavailable.' } }));
    await homePage.open();
    await chat.open();

    const [request] = await Promise.all([page.waitForRequest(CHAT_ENDPOINT), chat.send('How long is an MVP sprint?')]);

    expect(request.method()).toBe('POST');
    expect(request.headers()['content-type']).toContain('application/json');
    const body = request.postDataJSON();
    expect(body.message).toBe('How long is an MVP sprint?');
    expect(Array.isArray(body.history)).toBe(true);
    for (const turn of body.history) {
      expect(['user', 'assistant']).toContain(turn.role);
      expect(typeof turn.content).toBe('string');
    }
    // The user's own message must remain visible, and the server's error must be surfaced and dismissable.
    await expect(chat.dialog.getByText('How long is an MVP sprint?')).toBeVisible();
    await expect(chat.dialog.getByText('Pod is temporarily unavailable.')).toBeVisible();
    await chat.dialog.getByRole('button', { name: 'Dismiss error' }).click();
    await expect(chat.dialog.getByText('Pod is temporarily unavailable.')).toBeHidden();
  });

  test('chat renders the assistant reply from the { reply } response contract', async ({ homePage, chat, page }) => {
    await page.route(CHAT_ENDPOINT, (route) => route.fulfill({ status: 200, json: { reply: 'Our MVP sprint is 8 weeks.' } }));
    await homePage.open();
    await chat.open();
    await chat.send('How long is an MVP sprint?');
    await expect(chat.dialog.getByText('Our MVP sprint is 8 weeks.')).toBeVisible();

    // Second turn must carry the first exchange as history.
    const [second] = await Promise.all([page.waitForRequest(CHAT_ENDPOINT), chat.send('And pricing?')]);
    const { history } = second.postDataJSON();
    expect(history).toEqual(expect.arrayContaining([
      { role: 'user', content: 'How long is an MVP sprint?' },
      { role: 'assistant', content: 'Our MVP sprint is 8 weeks.' },
    ]));
  });
});
