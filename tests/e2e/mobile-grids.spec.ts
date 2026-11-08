import { expect, test, type Page } from './base';
import releases from '../fixtures/content/releases.json' with { type: 'json' };
import videos from '../fixtures/content/videos.json' with { type: 'json' };

/*
 * MOB-06..MOB-12, MOB-19 (AD-012, AD-013): below 768px the Loja, Discografia and Fãs lists lay
 * out 2 items per row, at 390 (the mobile project) and at 360 (the narrowest common Android).
 */
const WIDTHS = [390, 360];
const LONG_PRODUCT =
  'Pack de Palhetas Teste com um nome muito longo que não cabe em uma linha do card da loja oficial';

type Box = { x: number; y: number; width: number; height: number };

/** Boxes of the visible items matching `selector`, in document order. */
function boxes(page: Page, selector: string): Promise<Box[]> {
  return page.evaluate(
    (sel) =>
      [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => el.checkVisibility())
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
        }),
    selector,
  );
}

/**
 * Items sit 2 per row: each pair shares a top edge, side by side, and the next pair starts
 * below. An odd last item sits alone, left-aligned under the first column, one column wide.
 */
function expectTwoPerRow(items: Box[], what: string) {
  expect(items.length, `${what}: at least one item`).toBeGreaterThan(0);
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1];
    expect(Math.abs(left.x - items[0].x), `${what} #${i + 1} starts the row`).toBeLessThan(1);
    expect(Math.abs(left.width - items[0].width), `${what} #${i + 1} one column`).toBeLessThan(1);
    if (right) {
      expect(Math.abs(right.y - left.y), `${what} #${i + 2} shares the row`).toBeLessThan(1);
      expect(right.x, `${what} #${i + 2} right of #${i + 1}`).toBeGreaterThanOrEqual(
        left.x + left.width,
      );
      expect(Math.abs(right.width - left.width), `${what} #${i + 2} same width`).toBeLessThan(1);
    }
    const next = items[i + 2];
    if (next) {
      expect(next.y, `${what} #${i + 3} starts a new row`).toBeGreaterThanOrEqual(
        left.y + left.height,
      );
    }
  }
}

async function atWidth(page: Page, width: number, route: string) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(route);
}

/** The page has no horizontal scroll at the current viewport. */
async function expectNoSideScroll(page: Page, width: number) {
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scroll, `no horizontal page scroll at ${width}px`).toBeLessThanOrEqual(width);
}

/** The element is cut at 2 lines with an ellipsis and keeps its full name in `title`. */
async function expectClampedAtTwoLines(page: Page, selector: string, full: string) {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  await expect(el).toHaveAttribute('title', full);
  const box = await el.evaluate((node) => {
    const s = getComputedStyle(node);
    return {
      lineHeight: parseFloat(s.lineHeight),
      height: node.getBoundingClientRect().height,
      clipped: node.scrollHeight > node.clientHeight + 1,
      clamp: s.webkitLineClamp,
      overflow: s.textOverflow,
    };
  });
  // Exactly 2 lines tall, with the rest cut off behind an ellipsis.
  expect(box.height).toBeGreaterThan(box.lineHeight * 2 - 1);
  expect(box.height).toBeLessThanOrEqual(box.lineHeight * 2 + 1);
  expect(box.clipped).toBe(true);
  expect(box.clamp).toBe('2');
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the 2-column grids apply below 768px');
});

test.describe('loja', () => {
  test('MOB-06 loja shows products two per row', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'loja/');
      expectTwoPerRow(await boxes(page, '[data-product]'), `products at ${width}px`);
    }
  });

  test('MOB-07 product card hides sizes on phones', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'loja/');
      const cards = page.locator('[data-product]');
      await expect(cards).toHaveCount(7);
      for (const card of await cards.all()) {
        await expect(card.locator('img')).toBeVisible();
        await expect(card.locator('[data-product-name]')).toBeVisible();
        await expect(card.locator('[data-product-price]')).toBeVisible();
        await expect(card.locator('[data-product-action]')).toBeVisible();
        await expect(card.locator('[data-product-sizes]')).toBeHidden();
        await expect(card.getByText('Tamanho', { exact: true })).toBeHidden();
      }
    }
  });

  test('MOB-10 long names clamp at two lines with full title', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'loja/');
      await expectClampedAtTwoLines(
        page,
        `[data-product-name][title="${LONG_PRODUCT}"]`,
        LONG_PRODUCT,
      );
    }
  });

  test('MOB-11 odd last item is left aligned at one column', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'loja/');
      const items = await boxes(page, '[data-product]');
      // Fixtures: 7 products, so the last one sits alone.
      expect(items).toHaveLength(7);
      expectTwoPerRow(items, `products at ${width}px`);
      expect(items[6].y).toBeGreaterThanOrEqual(items[5].y + items[5].height);
    }
  });

  test('MOB-12 filtered items stay two per row', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'loja/');
      await page.getByRole('button', { name: 'Moletons', exact: true }).click();
      const items = await boxes(page, '[data-product]');
      expect(items).toHaveLength(2);
      expectTwoPerRow(items, `moletons at ${width}px`);
    }
  });

  test('MOB-19 two columns at 360px without horizontal scroll', async ({ page }) => {
    await atWidth(page, 360, 'loja/');
    expectTwoPerRow(await boxes(page, '[data-product]'), 'products at 360px');
    await expectNoSideScroll(page, 360);
  });
});

test.describe('discografia', () => {
  // Fixtures: 8 releases in the catalog (4 singles) and 11 videos.
  const LONG_RELEASE = 'Meu Fim (feat. Caio MacBeserra)';
  const LONG_VIDEO = 'EUTENIA - DE VOLTA AO SALÃO (Feat. Anny Cee)';

  test('MOB-08 discografia shows releases and videos two per row', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'discografia/');
      expectTwoPerRow(await boxes(page, '[data-release]'), `releases at ${width}px`);
      expectTwoPerRow(await boxes(page, '[data-video]'), `videos at ${width}px`);
      // Release cards drop their description (spec Assumptions, AD-012).
      for (const r of releases.filter((r) => r.descricao)) {
        await expect(page.locator('[data-release]').getByText(r.descricao!)).toBeHidden();
      }
    }
  });

  test('MOB-10 long names clamp at two lines with full title', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'discografia/');
      await expectClampedAtTwoLines(
        page,
        `[data-release] h3[title="${LONG_RELEASE}"]`,
        LONG_RELEASE,
      );
      await expectClampedAtTwoLines(page, `[data-video] h3[title="${LONG_VIDEO}"]`, LONG_VIDEO);
    }
  });

  test('MOB-11 odd last item is left aligned at one column', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'discografia/');
      const items = await boxes(page, '[data-video]');
      expect(items).toHaveLength(videos.length);
      expect(items.length % 2).toBe(1);
      expectTwoPerRow(items, `videos at ${width}px`);
      const last = items.length - 1;
      expect(items[last].y).toBeGreaterThanOrEqual(items[last - 1].y + items[last - 1].height);
    }
  });

  test('MOB-12 filtered items stay two per row', async ({ page }) => {
    for (const width of WIDTHS) {
      await atWidth(page, width, 'discografia/');
      await page.getByRole('button', { name: 'Singles', exact: true }).click();
      const items = await boxes(page, '[data-release]');
      expect(items).toHaveLength(releases.filter((r) => r.tipo === 'single').length);
      expectTwoPerRow(items, `singles at ${width}px`);
    }
  });

  test('MOB-19 two columns at 360px without horizontal scroll', async ({ page }) => {
    await atWidth(page, 360, 'discografia/');
    expectTwoPerRow(await boxes(page, '[data-release]'), 'releases at 360px');
    expectTwoPerRow(await boxes(page, '[data-video]'), 'videos at 360px');
    await expectNoSideScroll(page, 360);
  });
});
