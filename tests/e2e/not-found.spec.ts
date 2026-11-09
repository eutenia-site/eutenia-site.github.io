import { expect, test } from './base';

test('NAV-09 unknown path shows 404 with link to Início', async ({ page }) => {
  // baseURL is the site root, so this is /nao-existe/.
  const response = await page.goto('nao-existe/');
  expect(response!.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
  await expect(page).toHaveTitle('Página não encontrada | Eutenia');

  const home = page.locator('[data-not-found]').getByRole('link', { name: /Início/ });
  await expect(home).toHaveAttribute('href', '/');
  await home.click();
  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  await expect(page.locator('[data-not-found]')).toHaveCount(0);
});
