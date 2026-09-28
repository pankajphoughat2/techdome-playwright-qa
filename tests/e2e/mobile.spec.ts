import { test, expect } from '../../utils/fixtures';
import { CORE_PAGES, findHorizontalOverflow, knownBug, waitForStableLayout } from '../../utils/helpers';
import { BasePage } from '../../pages/BasePage';

/**
 * Pages observed to overflow (BUG-001). The leaf offender is the fixed header wrapper
 * (`div.fixed.top-0.left-0`) growing to the document width; on `/` at 768px it's the
 * decorative `.blueprint-grid` layer. Kept as an explicit list so a NEW overflowing
 * page fails loudly instead of being silently absorbed.
 */
const OVERFLOWING: Record<number, string[]> = {
  375: ['/', '/automation', '/products', '/life-at-techdome'],
  768: ['/'],
};

const VIEWPORTS = [
  { label: 'mobile 375px', width: 375, height: 812 },
  { label: 'tablet 768px', width: 768, height: 1024 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.label} @US-009 @US-010`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.width < 768, hasTouch: true });

    test('desktop nav collapses into a hamburger menu', async ({ page }) => {
      const base = new BasePage(page);
      await base.goto('/');
      await expect(base.primaryNav).toBeHidden();
      await expect(base.mobileMenuButton).toBeVisible();
    });

    test('hamburger opens a menu that navigates to a page', async ({ page }) => {
      const base = new BasePage(page);
      await base.goto('/');
      await expect(base.mobileMenuButton).toHaveAttribute('aria-controls', 'mobile-nav');
      // Button flips to "Close navigation" + aria-expanded — screen readers get the state change.
      await base.openMobileMenu();
      // Scoped to the panel on purpose: an earlier unscoped locator "passed" by clicking the
      // footer's Services link — the menu doesn't contain one (see BUG-008).
      for (const name of ['Staff Augmentation', 'About Us', 'Contact Us']) {
        await expect(base.mobileNav.getByRole('link', { name })).toBeVisible();
      }
      await base.mobileNav.getByRole('link', { name: 'Staff Augmentation' }).click();
      await expect(page).toHaveURL(/\/staff-augmentation$/);
      await expect(base.mobileNav).toBeHidden();
    });

    test('hero content and primary CTA fit the viewport', async ({ homePage }) => {
      await homePage.open();
      await expect(homePage.heroHeading).toBeVisible();
      await expect(homePage.bookTeardownCta).toBeInViewport();
      const box = await homePage.bookTeardownCta.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width);
      // WCAG 2.5.8 minimum target size is 24px; Apple/Google recommend 44px for touch.
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('hamburger button is fully inside the viewport', async ({ page }) => {
      if (vp.width === 375) knownBug('BUG-001', 'Homepage overflows at 375px; hamburger is pushed past the right edge');
      const base = new BasePage(page);
      await base.goto('/');
      const box = await base.mobileMenuButton.boundingBox();
      expect(box!.x + box!.width, 'hamburger right edge').toBeLessThanOrEqual(vp.width);
    });

    // Phones get every page (the persona lives there); tablets get a representative set.
    const paths = vp.width === 375 ? CORE_PAGES.map((p) => p.path) : ['/', '/contact', '/newsletter', '/services'];
    for (const path of paths) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        const known = OVERFLOWING[vp.width] ?? [];
        if (known.includes(path)) knownBug('BUG-001', `${path} is wider than a ${vp.width}px viewport`);
        const base = new BasePage(page);
        await base.goto(path);
        await waitForStableLayout(page);
        const result = await findHorizontalOverflow(page);
        await test.info().attach(`overflow-${vp.width}${path.replace(/\//g, '_')}.json`, {
          body: JSON.stringify(result, null, 2), contentType: 'application/json',
        });
        expect(result.scrollWidth, `document is ${result.scrollWidth}px wide in a ${result.viewport}px viewport; offenders: ${JSON.stringify(result.offenders)}`)
          .toBeLessThanOrEqual(result.viewport);
      });
    }
  });
}

test.describe('Responsive — phone landscape 812×375 @US-009', () => {
  test.use({ viewport: { width: 812, height: 375 }, isMobile: true, hasTouch: true });

  test('homepage has no horizontal overflow in landscape', async ({ page }) => {
    knownBug('BUG-001', 'Homepage overflows (818px) in an 812px landscape viewport');
    await page.goto('/');
    await waitForStableLayout(page);
    const r = await findHorizontalOverflow(page);
    expect(r.scrollWidth, JSON.stringify(r.offenders)).toBeLessThanOrEqual(r.viewport);
  });

  test('hero CTA is reachable without scrolling past a short viewport', async ({ homePage }) => {
    await homePage.open();
    await homePage.bookTeardownCta.scrollIntoViewIfNeeded();
    await expect(homePage.bookTeardownCta).toBeInViewport();
    await homePage.bookTeardownCta.click();
    await expect(homePage.page).toHaveURL(/\/contact$/);
  });
});

test.describe('Mobile menu behaviour @US-009', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('menu can be closed again with its own button', async ({ page }) => {
    const base = new BasePage(page);
    await base.goto('/');
    await base.openMobileMenu();
    await expect(base.mobileNav).toBeVisible();
    await base.mobileMenuCloseButton.click();
    await expect(base.mobileNav).toBeHidden();
    await expect(base.mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
