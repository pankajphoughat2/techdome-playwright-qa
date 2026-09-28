import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroHeading: Locator;
  readonly bookTeardownCta: Locator;
  readonly seeWorkCta: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.bookTeardownCta = page.getByRole('main').getByRole('link', { name: /Book a product teardown/ });
    this.seeWorkCta = page.getByRole('main').getByRole('link', { name: /See what we've built/ });
  }

  async open() {
    return this.goto('/');
  }
}
