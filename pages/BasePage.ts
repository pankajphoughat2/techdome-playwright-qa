import { expect, type Page, type Locator } from '@playwright/test';

/**
 * Selector strategy: role + accessible name first (these mirror what a user
 * and a screen reader perceive, and they survive Tailwind class churn).
 * Techdome's markup is utility-class soup with no data-testid attributes,
 * so CSS class selectors are avoided entirely.
 */
export class BasePage {
  readonly header: Locator;
  readonly primaryNav: Locator;
  readonly homeLink: Locator;
  readonly headerContactLink: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileMenuCloseButton: Locator;
  /** Panel referenced by the hamburger's aria-controls="mobile-nav". */
  readonly mobileNav: Locator;
  readonly footer: Locator;

  constructor(readonly page: Page) {
    this.header = page.locator('header').first();
    this.primaryNav = page.getByRole('navigation', { name: 'Primary' });
    this.homeLink = this.header.getByRole('link', { name: /Techdome Venture Studio — home/ });
    this.headerContactLink = this.header.getByRole('link', { name: 'Contact Us' });
    this.mobileMenuButton = page.getByRole('button', { name: 'Open navigation' });
    this.mobileMenuCloseButton = page.getByRole('button', { name: 'Close navigation' });
    this.mobileNav = page.locator('#mobile-nav');
    this.footer = page.locator('footer');
  }

  async goto(path: string) {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    return response;
  }

  /**
   * Opens the hamburger menu. A tap that lands before React hydrates does nothing (seen as
   * a flaky run), so retry the tap only while the menu is still closed. Never toggle it
   * shut again.
   */
  async openMobileMenu() {
    await expect(async () => {
      if (await this.mobileMenuButton.isVisible()) await this.mobileMenuButton.click();
      await expect(this.mobileMenuCloseButton).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
    }).toPass({ timeout: 15_000 });
  }

  navMenuButton(name: 'What we do' | 'Proof' | 'Company') {
    return this.primaryNav.getByRole('button', { name });
  }

  metaDescription() {
    return this.page.locator('meta[name="description"]').getAttribute('content');
  }
}
