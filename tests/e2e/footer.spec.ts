import { test, expect } from '../../utils/fixtures';

const SOCIALS = [
  { name: 'LinkedIn', host: 'www.linkedin.com', path: /^\/company\/techdome/ },
  { name: 'X', host: 'x.com', path: /^\/techdomesolves/ },
  { name: 'Instagram', host: 'www.instagram.com', path: /^\/techdome\.io/ },
  { name: 'GitHub', host: 'github.com', path: /^\/techdome-io/ },
  { name: 'Facebook', host: 'www.facebook.com', path: /^\/techdomesolutions/ },
];

test.describe('Footer @US-008', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await homePage.footer.scrollIntoViewIfNeeded();
  });

  for (const s of SOCIALS) {
    test(`${s.name} icon is present, accessible and points to Techdome's profile`, async ({ homePage }) => {
      const link = homePage.footer.locator(`a[href*="${s.host}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toBeVisible();
      const href = new URL((await link.getAttribute('href'))!);
      expect(href.hostname).toBe(s.host);
      expect(href.pathname).toMatch(s.path);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      // Icon-only links need an accessible name for screen readers.
      await expect(link).toHaveAccessibleName(new RegExp(s.name === 'X' ? '\\bX\\b' : s.name));
    });
  }

  test('legal and company links are present and route correctly', async ({ homePage, page }) => {
    for (const [name, path] of [['Privacy', '/privacy'], ['Terms', '/terms'], ['FAQ', '/faq'], ['Careers', '/careers']] as const) {
      await expect(homePage.footer.getByRole('link', { name: new RegExp(`^${name}`) })).toHaveAttribute('href', path);
    }
    await homePage.footer.getByRole('link', { name: /^Privacy/ }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle(/Privacy Policy/);
  });

  test('footer shows a current copyright year', async ({ homePage }) => {
    const text = await homePage.footer.innerText();
    const year = new Date().getFullYear();
    expect(text).toMatch(new RegExp(`${year}`));
  });
});
