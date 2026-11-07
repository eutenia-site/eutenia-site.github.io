import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // No third-party traffic in tests: the players are stubbed.
  await page.route(/youtube-nocookie\.com|open\.spotify\.com|i\.ytimg\.com/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><title>stub</title>',
    }),
  );
});

test('HOME-06 clip loads YouTube player only after activation', async ({ page }) => {
  await page.goto('./');
  const clip = page.locator('#clipe');
  await expect(clip.locator('iframe')).toHaveCount(0);
  const thumb = clip.locator('[data-lazy-youtube="Atv4aKAXEmg"] a');
  await expect(thumb).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Atv4aKAXEmg');

  // The hero's primary action leads to the clip section.
  await page.locator('[data-hero-clip]').click();
  await expect(page).toHaveURL(/#clipe$/);

  await thumb.click();
  const player = clip.locator('iframe');
  await expect(player).toHaveCount(1);
  await expect(player).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/Atv4aKAXEmg?autoplay=1',
  );
  await expect(player).toHaveAttribute('title', 'EUTENIA - INDESTRUTÍVEL [Clipe Oficial]');
});

test('HOME-07 shows at most 3 upcoming shows', async ({ page }) => {
  // Fixtures: 6 upcoming shows (2099) and 2 past (2020).
  await page.goto('./');
  const rows = page.locator('[data-home-shows] [data-show]:visible');
  await expect(rows).toHaveCount(3);
  await expect(rows.locator('[data-show-place]')).toHaveText([
    'Curitiba, PR',
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
  ]);
  await expect(page.locator('[data-shows-empty]')).toBeHidden();

  // With the browser a day after the two 2099-03-10 shows, the next three move up.
  await page.clock.setFixedTime(new Date('2099-03-11T12:00:00-03:00'));
  await page.reload();
  await expect(rows).toHaveCount(3);
  await expect(rows.locator('[data-show-place]')).toHaveText([
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
  ]);

  // After every show, the empty state replaces the list.
  await page.clock.setFixedTime(new Date('2100-01-01T12:00:00-03:00'));
  await page.reload();
  await expect(rows).toHaveCount(0);
  await expect(page.locator('[data-shows-empty]')).toBeVisible();
  await expect(page.locator('[data-shows-empty]')).toContainText(
    'Nenhum show anunciado no momento',
  );
});

test('HOME-08 merch lists 3 featured products', async ({ page }) => {
  await page.goto('./');
  const cards = page.locator('[data-home-merch] [data-product]');
  // Fixtures: 7 products, 3 marked destaque.
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('h3')).toHaveText(['Camiseta Teste', 'Moletom Teste', 'Vinil Teste']);
  await expect(cards.nth(0)).toContainText('R$');
  await expect(cards.nth(0).getByRole('link', { name: /Comprar Camiseta Teste/ })).toHaveAttribute(
    'href',
    'https://loja.exemplo.com/camiseta',
  );
});
