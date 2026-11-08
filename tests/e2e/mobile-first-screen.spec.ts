import { expect, test, type Page } from './base';

/*
 * MOB-13..MOB-18 (AD-014): below 768px the Contato, Fãs and Loja heroes are compact, so the
 * first content starts on the first screen of 390×844, above the bottom bar (y < 778). The
 * Contato hero gains "ENVIAR MENSAGEM", which jumps to the message form.
 */
const FIRST_SCREEN = 778;

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the first screen is measured at 390×844');
});

/** Top edge of the element in the viewport, right after the page opens. */
async function topOf(page: Page, selector: string): Promise<number> {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  return el.evaluate((node) => node.getBoundingClientRect().top);
}

/**
 * Taps "ENVIAR MENSAGEM" and checks the form heading lands fully visible: below the sticky
 * header and above the bottom bar.
 */
async function expectJumpToForm(page: Page) {
  await page.goto('contato/');
  await page.getByRole('link', { name: 'Enviar mensagem' }).tap();
  await expect(page).toHaveURL(/#mensagem-titulo$/);
  // Let any scroll finish: the page has scrolled and holds still for 100ms.
  // (Polled from the test, so it also runs with JavaScript disabled in the page.)
  const scrollY = () => page.evaluate(() => window.scrollY);
  await expect
    .poll(async () => {
      const before = await scrollY();
      await page.waitForTimeout(100);
      return before > 0 && (await scrollY()) === before;
    })
    .toBe(true);
  const { header, top, bottom } = await page.evaluate(() => {
    const h = document.querySelector('header')!.getBoundingClientRect();
    const t = document.getElementById('mensagem-titulo')!.getBoundingClientRect();
    return { header: h.bottom, top: t.top, bottom: t.bottom };
  });
  expect(top, 'form heading starts below the sticky header').toBeGreaterThanOrEqual(header);
  expect(bottom, 'form heading ends above the bottom bar').toBeLessThanOrEqual(FIRST_SCREEN);
}

test('MOB-13 contato departments heading on first screen', async ({ page }) => {
  await page.goto('contato/');
  const top = await topOf(page, '#departamentos-titulo');
  expect(top, '"Departamentos & contatos diretos" top').toBeLessThan(FIRST_SCREEN);
});

test('MOB-16 contato hero shows enviar mensagem', async ({ page }) => {
  await page.goto('contato/');
  const link = page.getByRole('link', { name: 'Enviar mensagem' });
  await expect(link).toBeVisible();
  await expect(link).toHaveText(/enviar mensagem/i);
  await expect(link).toHaveAttribute('href', '#mensagem-titulo');
  // Inside the hero, shown in uppercase (DESIGN.md labels).
  expect(await link.evaluate((a) => a.closest('section')?.querySelector('h1') !== null)).toBe(true);
  expect(await link.evaluate((a) => getComputedStyle(a).textTransform)).toBe('uppercase');

  // Desktop keeps the site-v0 hero: no link at 1280.
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(link).toBeHidden();
});

test.describe('MOB-17 enviar mensagem scrolls to the form heading', () => {
  test('with JavaScript', async ({ page }) => {
    await expectJumpToForm(page);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('with JavaScript disabled', async ({ page }) => {
      await expectJumpToForm(page);
    });
  });
});

test('MOB-14 fas wallpapers heading on first screen', async ({ page }) => {
  await page.goto('fas/');
  const top = await topOf(page, '#wallpapers-titulo');
  expect(top, '"Wallpapers oficiais" top').toBeLessThan(FIRST_SCREEN);
});

test('MOB-18 fas leaves bottom bar unmarked', async ({ page }) => {
  await page.goto('fas/');
  const bar = page.getByRole('navigation', { name: 'Barra de navegação' });
  await expect(bar).toBeVisible();
  const items = bar.getByRole('link');
  await expect(items).toHaveText(
    ['Início', 'Música', 'Shows', 'Loja', 'Contato'].map((l) => new RegExp(`${l}$`, 'i')),
  );
  await expect(bar.locator('[aria-current]')).toHaveCount(0);
});

test('MOB-15 loja filter bar on first screen', async ({ page }) => {
  await page.goto('loja/');
  const top = await topOf(page, '[data-filter-bar]');
  expect(top, 'category filter bar top').toBeLessThan(FIRST_SCREEN);
});
