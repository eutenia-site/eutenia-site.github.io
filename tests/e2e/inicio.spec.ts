import { expect, test } from './base';

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

  await thumb.click();
  const player = clip.locator('iframe');
  await expect(player).toHaveCount(1);
  await expect(player).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/Atv4aKAXEmg?autoplay=1',
  );
  await expect(player).toHaveAttribute('title', 'EUTENIA - INDESTRUTÍVEL [Clipe Oficial]');
});

test('HOME-03 hero clip action opens the official clip player', async ({ page }) => {
  await page.goto('./');
  const clip = page.locator('#clipe');
  await expect(clip.locator('iframe')).toHaveCount(0);

  const action = page.locator('[data-hero-clip]');
  await expect(action).toHaveText(/Assistir clipe oficial/i);
  await expect(action).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Atv4aKAXEmg');
  await action.click();

  // The page stays on the site, scrolls to the clip section and the player appears there.
  await expect(page).toHaveURL(/#clipe$/);
  const player = clip.locator('iframe');
  await expect(player).toHaveCount(1);
  await expect(player).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/Atv4aKAXEmg?autoplay=1',
  );
  await expect(clip).toBeInViewport();
});

test('HOME-03 hero clip action without JavaScript links the YouTube clip', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(test.info().project.use.baseURL!);
  await expect(page.locator('[data-hero-clip]')).toHaveAttribute(
    'href',
    'https://www.youtube.com/watch?v=Atv4aKAXEmg',
  );
  await context.close();
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

test('HOME-01 hero description and newest release badge', async ({ page }) => {
  await page.goto('./');
  // The featured release's descricao sits under the subtitle, before the actions.
  const hero = page.locator('#hero');
  const description = hero.getByText(/^Pandora, o álbum de 2024 da Eutenia/);
  await expect(description).toBeVisible();
  const descBox = (await description.boundingBox())!;
  const actionBox = (await hero.locator('[data-hero-clip]').boundingBox())!;
  expect(descBox.y + descBox.height).toBeLessThanOrEqual(actionBox.y);

  // Only the newest card carries a badge, naming its real type (fixtures: Pandora, an album).
  const badges = page.locator('[data-latest] [data-new-badge]');
  await expect(badges).toHaveCount(1);
  await expect(badges).toHaveText('Novo álbum');
  await expect(page.locator('[data-latest] li').first().locator('[data-new-badge]')).toBeVisible();
  await expect(badges).toHaveCSS('background-color', 'rgb(255, 42, 59)');
});

test('HOME-02 mobile section links, merch buttons and compact show rows', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-inicio.png layout');
  await page.goto('./');

  // Section headers: the link sits to the right of the heading, on the same band.
  for (const id of ['lancamentos-titulo', 'shows-titulo', 'merch-titulo']) {
    const heading = page.locator(`#${id}`);
    const link = heading.locator('xpath=ancestor::div[2]').getByRole('link');
    const h = (await heading.boundingBox())!;
    const l = (await link.boundingBox())!;
    expect(l.x, id).toBeGreaterThanOrEqual(h.x + h.width - 1);
    expect(l.y, id).toBeLessThan(h.y + h.height);
  }

  // Merch cards: a full-width labelled action under the price.
  const card = page.locator('[data-home-merch] [data-product]').first();
  const action = card.locator('[data-merch-action]');
  await expect(action).toBeVisible();
  await expect(action).toHaveText(/Comprar/i);
  await expect(action).toHaveAttribute('href', 'https://loja.exemplo.com/camiseta');
  await expect(action).toHaveAttribute('target', '_blank');
  const price = (await card.getByText(/R\$/).boundingBox())!;
  const a = (await action.boundingBox())!;
  const c = (await card.boundingBox())!;
  expect(a.y).toBeGreaterThan(price.y + price.height - 1);
  expect(a.width).toBeGreaterThan(c.width * 0.8);
  // A product without a link: disabled "Em breve" (LOJA-04 semantics).
  const vinil = page.locator('[data-home-merch] [data-product]', { hasText: 'Vinil Teste' });
  await expect(vinil.locator('button[data-merch-action]')).toHaveText(/Em breve/i);
  await expect(vinil.locator('button[data-merch-action]')).toBeDisabled();

  // Show rows: one compact line with the action on the right and a red accent when on sale.
  const row = page.locator('[data-home-shows] [data-show]:visible').first();
  const buy = row.getByRole('link', { name: /Comprar ingresso/ });
  await expect(buy).toHaveText(/Comprar ingresso/i);
  const place = (await row.locator('[data-show-place]').boundingBox())!;
  const b = (await buy.boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(place.x + place.width);
  expect(b.y).toBeLessThan(place.y + place.height);
  const accent = row.locator('span[aria-hidden="true"]').first();
  await expect(accent).toHaveCSS('background-color', 'rgb(255, 42, 59)');
});

test('HOME-01 desktop show action reads Comprar ingresso as SHOW-07 names it', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'inicio.png layout');
  await page.goto('./');
  const buy = page
    .locator('[data-home-shows] [data-show]:visible')
    .first()
    .getByRole('link', { name: /Comprar ingresso/ });
  await expect(buy).toHaveText('Comprar ingresso');
});

test('HOME-02 mobile release card ends with icon row and outlined OUVIR AGORA', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  const card = page.locator('[data-latest] li').first();
  const actions = card.locator('[data-latest-mobile-actions]');
  if (testInfo.project.name !== 'mobile') {
    await expect(actions).toBeHidden();
    return;
  }
  await expect(actions).toBeVisible();
  const button = actions.getByText('Ouvir agora');
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('border-top-style', 'solid');
  await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(actions.locator('.material-symbols-outlined')).toHaveCount(2);
  // icons left, button right
  const icons = (await actions.locator('.material-symbols-outlined').first().boundingBox())!;
  const b = (await button.boundingBox())!;
  expect(b.x).toBeGreaterThan(icons.x + icons.width);
});
