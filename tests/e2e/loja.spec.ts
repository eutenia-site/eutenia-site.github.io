import { expect, test, type Page } from './base';

// Fixtures: 7 products, 2 moletons; only camiseta, moletom and cd have a checkout URL.
// A legacy lojaUrl is configured to verify that it never enables another product's checkout.
const LONG_NAME =
  'Pack de Palhetas Teste com um nome muito longo que não cabe em uma linha do card da loja oficial';
const card = (page: Page, nome: string) =>
  page.locator('[data-product]', { has: page.locator(`[title="${nome}"]`) });

test('LOJA-02 category filter shows only that category', async ({ page }) => {
  await page.goto('loja/');
  const items = page.locator('[data-product]');
  await expect(items).toHaveCount(7);
  const moletons = page.getByRole('button', { name: 'Moletons', exact: true });
  await expect(moletons).toHaveAttribute('aria-pressed', 'false');
  await moletons.click();

  await expect(moletons).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Todos' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  const visible = page.locator('[data-product]:visible');
  await expect(visible).toHaveCount(2);
  await expect(visible.locator('[data-product-name]')).toHaveText([
    'Moletom Teste',
    'Moletom Teste Dois',
  ]);
  await expect(visible.locator('[data-product-category]')).toHaveText(['Moletons', 'Moletons']);

  await page.getByRole('button', { name: 'Todos' }).click();
  await expect(page.locator('[data-product]:visible')).toHaveCount(7);
});

test('LOJA-04 comprar navigates to product checkout, em breve disabled without its own link', async ({
  page,
}) => {
  await page
    .context()
    .route(/loja\.exemplo\.com/, (r) =>
      r.fulfill({ contentType: 'text/html', body: '<title>loja</title>' }),
    );
  for (const [name, checkout] of [
    ['Camiseta Teste', 'https://loja.exemplo.com/camiseta'],
    ['Moletom Teste', 'https://loja.exemplo.com/moletom'],
    ['CD Teste', 'https://loja.exemplo.com/cd'],
  ]) {
    await page.goto('loja/');
    const buy = card(page, name).getByRole('link', { name: /Comprar/ });
    await expect(buy).toHaveText(/Comprar/i);
    await expect(buy).not.toHaveAttribute('target', '_blank');
    await buy.click();
    await expect(page).toHaveURL(checkout);
  }
  await page.goto('loja/');

  // No product URL: disabled EM BREVE even when a global store URL exists.
  const vinil = card(page, 'Vinil Teste');
  const soon = vinil.locator('[data-product-action]');
  await expect(soon).toHaveText(/Em breve/i);
  await expect(soon).toBeDisabled();
  await expect(vinil.getByRole('link')).toHaveCount(0);
});

test('LOJA-08 photo gallery cycles with buttons and keyboard independently', async ({ page }) => {
  await page.goto('loja/');
  const gallery = card(page, 'Camiseta Teste').locator('[data-product-gallery]');
  const image = gallery.locator('[data-gallery-image]');
  const index = gallery.locator('[data-gallery-index]');
  const otherImage = card(page, 'Moletom Teste').locator('[data-gallery-image]');
  const otherSrc = await otherImage.getAttribute('src');
  await expect(gallery.locator('img')).toHaveCount(1);
  await expect(index).toHaveText('1');
  await gallery.locator('[data-gallery-next]').click();
  await expect(index).toHaveText('2');
  await expect(image).toHaveAttribute('src', /camiseta-chymia-ii\.jpg$/);
  await expect(otherImage).toHaveAttribute('src', otherSrc!);
  await gallery.locator('[data-gallery-prev]').click();
  await expect(index).toHaveText('1');
  await gallery.locator('[data-gallery-prev]').click();
  await expect(index).toHaveText('3');
  await gallery.focus();
  await gallery.press('Home');
  await expect(index).toHaveText('1');
  await gallery.press('End');
  await expect(index).toHaveText('3');
  await gallery.press('ArrowRight');
  await expect(index).toHaveText('1');
  await gallery.press('ArrowLeft');
  await expect(index).toHaveText('3');
  await expect(card(page, 'Moletom Teste').locator('[data-gallery-controls]')).toHaveCount(0);
});

test('LOJA-08 touch swipe changes the product photo', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'touch navigation applies on mobile');
  await page.goto('loja/');
  const gallery = card(page, 'Camiseta Teste').locator('[data-product-gallery]');
  await gallery.scrollIntoViewIfNeeded();
  const box = (await gallery.boundingBox())!;
  const session = await context.newCDPSession(page);
  const y = box.y + box.height * 0.25;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: box.x + box.width * 0.8, y }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: box.x + box.width * 0.2, y }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(gallery.locator('[data-gallery-index]')).toHaveText('2');
  await session.detach();
});

test.describe('gallery without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('LOJA-08 shows the cover and hides interactive controls', async ({ page }) => {
    await page.goto('loja/');
    const gallery = card(page, 'Camiseta Teste').locator('[data-product-gallery]');
    await expect(gallery.locator('img')).toBeVisible();
    await expect(gallery.locator('img')).toHaveAttribute('src', /camiseta-pandora\.jpg$/);
    await expect(gallery.locator('[data-gallery-controls]:visible')).toHaveCount(0);
  });
});

test('LOJA-07 long product name truncates with title', async ({ page }, testInfo) => {
  // Q31: below 768px MOB-10 replaces LOJA-07
  test.skip(testInfo.project.name !== 'desktop', 'LOJA-07 applies from 768px');
  await page.goto('loja/');
  const name = page.locator(`[data-product-name][title="${LONG_NAME}"]`);
  await expect(name).toBeVisible();
  await expect(name).toHaveAttribute('title', LONG_NAME);
  await expect(name).toHaveText(LONG_NAME);
  const box = await name.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      overflow: s.textOverflow,
      wrap: s.whiteSpace,
      lineHeight: parseFloat(s.lineHeight),
      height: el.getBoundingClientRect().height,
      clipped: el.scrollWidth > el.clientWidth,
    };
  });
  expect(box.overflow).toBe('ellipsis');
  expect(box.wrap).toBe('nowrap');
  expect(box.clipped).toBe(true);
  // One line.
  expect(box.height).toBeLessThanOrEqual(box.lineHeight + 1);
});
