import { test as base, expect, type ConsoleMessage } from '@playwright/test';
import { isAnalyticsUrl } from './helpers';
import { HomePage } from '../pages/HomePage';
import { NewsletterPage } from '../pages/NewsletterPage';
import { ContactPage } from '../pages/ContactPage';
import { ChatWidget } from '../pages/ChatWidget';

type Options = {
  /** When false (default), analytics/tracking requests are aborted so tests don't pollute Techdome's analytics. */
  allowAnalytics: boolean;
};

type Fixtures = {
  homePage: HomePage;
  newsletterPage: NewsletterPage;
  contactPage: ContactPage;
  chat: ChatWidget;
  /** Console errors and uncaught page errors collected during the test. */
  consoleErrors: string[];
  _analyticsGuard: void;
};

export const test = base.extend<Options & Fixtures>({
  allowAnalytics: [false, { option: true }],

  _analyticsGuard: [
    async ({ context, allowAnalytics }, use) => {
      if (!allowAnalytics) {
        await context.route((url) => isAnalyticsUrl(url.toString()), (route) => route.abort('blockedbyclient'));
      }
      await use();
    },
    { auto: true },
  ],

  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    const onConsole = (msg: ConsoleMessage) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Our own analytics blocking surfaces as a net::ERR_BLOCKED_BY_CLIENT console error — not a site bug.
      if (/ERR_BLOCKED_BY_CLIENT/.test(text)) return;
      errors.push(`[console] ${text} @ ${msg.location().url}`);
    };
    page.on('console', onConsole);
    page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
    await use(errors);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  newsletterPage: async ({ page }, use) => use(new NewsletterPage(page)),
  contactPage: async ({ page }, use) => use(new ContactPage(page)),
  chat: async ({ page }, use) => use(new ChatWidget(page)),
});

export { expect };
