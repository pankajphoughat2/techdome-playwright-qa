import { test, expect } from '../../utils/fixtures';

test.describe('Homepage @US-001', () => {
  test('loads with correct title, meta description and hero content', async ({ homePage, page }) => {
    const response = await homePage.open();
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle('Techdome — Custom Software Development Company & Venture Studio');

    const description = await homePage.metaDescription();
    expect(description).toBeTruthy();
    expect(description!).toContain('venture studio');
    // Google truncates around 155-160 chars; a description is a snippet, not a paragraph.
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThanOrEqual(200);

    await expect(homePage.heroHeading).toHaveCount(1);
    await expect(homePage.heroHeading).toHaveText(/Your product team,\s*fully assembled\./);
    await expect(homePage.bookTeardownCta).toBeVisible();
    await expect(homePage.seeWorkCta).toBeVisible();
  });

  test('exposes social-share metadata (Open Graph + canonical)', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Techdome/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/techdome\.io\/?$/);
  });

  test('trust badges link to the real third-party profiles', async ({ homePage, page }) => {
    await homePage.open();
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: 'Upwork Upwork Top Rated Plus' })).toHaveAttribute('href', 'https://www.upwork.com/agencies/techdome');
    await expect(main.getByRole('link', { name: /Product Hunt/ }).first()).toHaveAttribute('href', /producthunt\.com\/products\/sparrow/);
  });
});
