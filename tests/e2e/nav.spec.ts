import { expect, test } from '@playwright/test';
import site from '../fixtures/content/site.json' with { type: 'json' };

const PAGES = [
  { label: 'Início', route: './' },
  { label: 'Discografia', route: 'discografia/' },
  { label: 'Shows', route: 'shows/' },
  { label: 'Loja', route: 'loja/' },
  { label: 'Fãs', route: 'fas/' },
  { label: 'Contato', route: 'contato/' },
];
const LABELS = PAGES.map((p) => p.label);
const SOCIAL_URLS = Object.values(site.social);

const PRIMARY = 'rgb(255, 179, 175)';

test('NAV-02 header links order and aria-current', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'header links show at desktop width');
  let visited = 0;
  for (const current of PAGES) {
    const response = await page.goto(current.route);
    // Pages are added by later tasks; NAV-01 and NAV-08 fail on a missing one.
    if (response?.status() === 404) continue;
    visited++;
    const links = page.getByRole('banner').getByRole('navigation').getByRole('link');
    await expect(links).toHaveText(LABELS);

    // The current link is reached by clicking it, and the click keeps it current.
    await links.filter({ hasText: current.label }).click();
    await expect(links.filter({ hasText: current.label })).toHaveAttribute('aria-current', 'page');
    for (const label of LABELS) {
      const link = links.filter({ hasText: label });
      if (label === current.label) {
        await expect(link).toHaveCSS('border-bottom-width', '2px');
        await expect(link).toHaveCSS('border-bottom-color', PRIMARY);
        await expect(link).toHaveCSS('color', PRIMARY);
      } else {
        await expect(link).not.toHaveAttribute('aria-current', /.*/);
        await expect(link).toHaveCSS('border-bottom-width', '0px');
        await expect(link).not.toHaveCSS('color', PRIMARY);
      }
    }
  }
  expect(visited).toBeGreaterThan(0);
});

test('NAV-03 ouvir agora opens Spotify in new tab', async ({ page, context }) => {
  await context.route('https://open.spotify.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Spotify</title>' }),
  );
  await page.goto('./');
  const link = page
    .getByRole('banner')
    .getByRole('link', { name: /ouvir agora/i })
    .filter({ visible: true });
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('href', site.social.spotify);

  const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe(site.social.spotify);
  expect(page.url()).toMatch(/\/eutenia-site\/$/);
});

test('NAV-05 menu opens drawer and focuses first link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the menu button is the mobile navigation');
  await page.goto('./');
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer).toBeHidden();

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(drawer).toBeVisible();
  const links = drawer.getByRole('navigation').getByRole('link');
  await expect(links).toHaveCount(LABELS.length);
  for (const [i, label] of LABELS.entries()) {
    await expect(links.nth(i)).toBeVisible();
    await expect(links.nth(i)).toHaveAccessibleName(label);
  }
  await expect(links.first()).toBeFocused();
  await expect(links.first()).toHaveAttribute('aria-current', 'page');

  const socials = drawer.getByRole('list', { name: 'Redes sociais' }).getByRole('link');
  await expect(socials).toHaveCount(5);
  for (const [i, href] of SOCIAL_URLS.entries()) {
    await expect(socials.nth(i)).toBeVisible();
    await expect(socials.nth(i)).toHaveAttribute('href', href);
  }
});

test('NAV-06 Esc closes drawer and restores focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the menu button is the mobile navigation');
  await page.goto('./');
  const menu = page.getByRole('button', { name: 'Abrir menu' });
  const drawer = page.getByRole('dialog', { name: 'Menu' });

  await menu.click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(menu).toBeFocused();

  await menu.click();
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Fechar menu' }).click();
  await expect(drawer).toBeHidden();
  await expect(menu).toBeFocused();
});
