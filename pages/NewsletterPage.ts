import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export const SUBSCRIBE_ENDPOINT = '**/api/newsletter/subscribe';

/**
 * The newsletter form is the only native <form> that posts to Techdome's
 * backend (the contact page is a Calendly embed). Note: the email input has
 * no <label> or aria-label (see BUG in docs/bugs.md), so placeholder is the
 * only user-visible handle — getByRole('textbox', { name }) cannot work here.
 */
export class NewsletterPage extends BasePage {
  readonly form: Locator;
  readonly emailInput: Locator;
  readonly subscribeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByRole('main').locator('form').filter({ has: page.locator('input[type="email"]') }).first();
    this.emailInput = this.form.getByPlaceholder('Enter your email');
    this.subscribeButton = this.form.getByRole('button', { name: 'Subscribe' });
  }

  async open() {
    await this.goto('/newsletter');
    // The form fades in via an on-mount animation (starts at opacity:0).
    await this.form.scrollIntoViewIfNeeded();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async subscribe(email: string) {
    await this.emailInput.fill(email);
    await this.subscribeButton.click();
  }

  /** Success replaces the form with a confirmation box, so status text is looked up in <main>, not inside the form. */
  statusMessage(text: string | RegExp) {
    return this.page.getByRole('main').getByText(text);
  }

  /** Browser-native constraint validation message (e.g. for required/type=email). */
  validationMessage() {
    return this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  }
}
