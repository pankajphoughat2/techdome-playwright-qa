import { test, expect } from '../../utils/fixtures';

test.describe('Contact / scoping call @US-003', () => {
  test('contact page embeds the Calendly scheduler and email fallback', async ({ contactPage, page }) => {
    await contactPage.open();
    await expect(page).toHaveTitle(/Talk to an Architect/);
    await expect(contactPage.heading).toHaveText(/Talk to an architect/i);

    await expect(contactPage.calendlyFrame).toHaveCount(1);
    const src = await contactPage.calendlyFrame.getAttribute('src');
    const url = new URL(src!);
    expect(url.hostname).toBe('calendly.com');
    expect(url.pathname).toMatch(/^\/[\w-]+\/[\w-]+/);

    // The scheduler must actually render inside the iframe, not just exist as a tag.
    const frame = page.frameLocator('iframe[src*="calendly.com"]');
    await expect(frame.locator('body')).toContainText(/\w+/, { timeout: 20_000 });

    await expect(contactPage.emailLinks.first()).toHaveAttribute('href', /^mailto:[^@]+@techdome\.net\.in$/);
  });

  test('"Open in new tab" link points at the same Calendly event', async ({ contactPage }) => {
    await contactPage.open();
    const iframeSrc = new URL((await contactPage.calendlyFrame.getAttribute('src'))!);
    const link = contactPage.openInNewTab;
    await expect(link).toHaveAttribute('target', '_blank');
    const href = new URL((await link.getAttribute('href'))!);
    expect(href.hostname).toBe('calendly.com');
    expect(href.pathname).toBe(iframeSrc.pathname);
  });
});
