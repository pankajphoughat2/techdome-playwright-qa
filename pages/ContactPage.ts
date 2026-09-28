import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * /contact has no native form — enquiries go through an embedded Calendly
 * scheduler or a mailto: link. We assert the embed is wired correctly but do
 * not book real meetings on a real person's calendar.
 */
export class ContactPage extends BasePage {
  readonly heading: Locator;
  readonly calendlyFrame: Locator;
  readonly openInNewTab: Locator;
  readonly emailLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.calendlyFrame = page.locator('iframe[src*="calendly.com"]');
    this.openInNewTab = page.getByRole('link', { name: /Open in new tab/ });
    this.emailLinks = page.getByRole('main').locator('a[href^="mailto:"]');
  }

  async open() {
    return this.goto('/contact');
  }
}
