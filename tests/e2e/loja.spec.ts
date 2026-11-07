import { expect, test, type Page } from '@playwright/test';

// Fixtures: 7 products, 2 moletons; camiseta, moletom and cd have a URL; lojaUrl is empty.
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

test('LOJA-04 comprar opens product link, em breve disabled without link', async ({ page }) => {
  await page
    .context()
    .route(/loja\.exemplo\.com/, (r) =>
      r.fulfill({ contentType: 'text/html', body: '<title>loja</title>' }),
    );
  await page.goto('loja/');

  const camiseta = card(page, 'Camiseta Teste');
  const buy = camiseta.getByRole('link', { name: /Comprar/ });
  await expect(buy).toHaveText(/Comprar/i);
  await expect(buy).toHaveAttribute('target', '_blank');
  const [popup] = await Promise.all([page.waitForEvent('popup'), buy.click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe('https://loja.exemplo.com/camiseta');
  await popup.close();

  // No product URL and no store URL: disabled EM BREVE, no link.
  const vinil = card(page, 'Vinil Teste');
  const soon = vinil.locator('[data-product-action]');
  await expect(soon).toHaveText(/Em breve/i);
  await expect(soon).toBeDisabled();
  await expect(vinil.getByRole('link')).toHaveCount(0);
});

test('LOJA-07 long product name truncates with title', async ({ page }) => {
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
