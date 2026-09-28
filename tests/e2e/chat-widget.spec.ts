import { test, expect } from '../../utils/fixtures';
import { knownBug } from '../../utils/helpers';
import { CHAT_ENDPOINT } from '../../pages/ChatWidget';

test.describe('Pod AI assistant @US-013', () => {
  test.beforeEach(async ({ page }) => {
    // Every real call costs Techdome LLM spend — never let one through.
    await page.route(CHAT_ENDPOINT, (route) => route.fulfill({ status: 200, json: { reply: 'Mocked reply.' } }));
  });

  test('opens as an accessible modal dialog and closes again', async ({ homePage, chat }) => {
    await homePage.open();
    await chat.open();
    await expect(chat.dialog).toHaveAttribute('aria-modal', 'true');
    await expect(chat.input).toBeFocused(); // focus moves into the dialog on open
    await expect(chat.sendButton).toBeDisabled(); // nothing typed yet
    await chat.input.fill('Hi');
    await expect(chat.sendButton).toBeEnabled();
    await chat.closeButton.click();
    await expect(chat.dialog).toBeHidden();
  });

  test('whitespace-only messages cannot be sent', async ({ homePage, chat, page }) => {
    let requests = 0;
    await page.route(CHAT_ENDPOINT, (route) => { requests++; return route.fulfill({ json: { reply: 'x' } }); });
    await homePage.open();
    await chat.open();
    await chat.input.fill('    ');
    await expect(chat.sendButton).toBeDisabled();
    await chat.input.press('Enter');
    expect(requests).toBe(0);
  });

  test('Enter sends the message', async ({ homePage, chat, page }) => {
    await homePage.open();
    await chat.open();
    await chat.input.fill('Do you sign NDAs?');
    const [req] = await Promise.all([page.waitForRequest(CHAT_ENDPOINT), chat.input.press('Enter')]);
    expect(req.postDataJSON().message).toBe('Do you sign NDAs?');
    await expect(chat.dialog.getByText('Mocked reply.')).toBeVisible();
    await expect(chat.input).toHaveValue('');
  });

  test('quick-topic cards send a pre-written question', async ({ homePage, chat, page }) => {
    await homePage.open();
    await chat.open();
    const [req] = await Promise.all([
      page.waitForRequest(CHAT_ENDPOINT),
      chat.dialog.getByRole('button', { name: /Studio Sprint/ }).click(),
    ]);
    const { message, history } = req.postDataJSON();
    expect(message).toMatch(/MVP/i);
    expect(history.at(-1)).toEqual({ role: 'user', content: message });
  });

  test('message input enforces its 200-character limit', async ({ homePage, chat }) => {
    await homePage.open();
    await chat.open();
    await chat.input.fill('x'.repeat(250));
    expect((await chat.input.inputValue()).length).toBe(200);
  });

  test('Escape closes the dialog and returns focus to the launcher', async ({ homePage, chat, page }) => {
    knownBug('BUG-010', 'Closing the chat drops focus to <body> instead of the launcher');
    await homePage.open();
    await chat.open();
    await page.keyboard.press('Escape');
    await expect(chat.dialog).toBeHidden();
    // WCAG 2.4.3 Focus Order — keyboard users must land back where they were.
    await expect(chat.launcher).toBeFocused();
  });

  test('keyboard focus stays inside the modal while it is open', async ({ homePage, chat, page }) => {
    knownBug('BUG-010', 'aria-modal dialog does not trap Tab focus');
    await homePage.open();
    await chat.open();
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(inside, 'focus escaped the aria-modal dialog').toBe(true);
  });

  test('"Schedule a call" shortcut in the chat routes to booking', async ({ homePage, chat, page }) => {
    await homePage.open();
    await chat.open();
    const schedule = chat.dialog.getByRole('button', { name: 'Schedule a call' });
    await expect(schedule).toBeVisible();
    const popup = page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
    await schedule.click();
    const newTab = await popup;
    const url = newTab ? newTab.url() : page.url();
    expect(url).toMatch(/calendly\.com|\/contact/);
  });
});
