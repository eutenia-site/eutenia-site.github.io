import { expect, test, type Page } from './base';
import { auditPages } from './mobile-audit';

/*
 * MOB-01 / MOB-03 (AD-011): below 768px every visible text node is at least 12px and every
 * input, select and textarea renders at 16px or more, on the 7 pages and the 404.
 */

/** Visible text nodes under 12px, named by element, text and size. */
function smallText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const hits: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent!.trim();
      const el = node.parentElement;
      if (!text || !el) continue;
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      range.selectNodeContents(node);
      // A box of 1px or less is visually hidden text (sr-only), not visible text.
      const shown = [...range.getClientRects()].some((r) => r.width > 1 && r.height > 1);
      if (!shown) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12) {
        const name = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`;
        hits.push(`${name} "${text.slice(0, 40)}" ${size}px`);
      }
    }
    return hits;
  });
}

/** Visible fields under 16px, named by element, name/id and size. */
function smallFields(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('input, select, textarea')]
      .filter((el) => (el as HTMLInputElement).type !== 'hidden' && el.checkVisibility())
      .map((el) => ({ el, size: parseFloat(getComputedStyle(el).fontSize) }))
      .filter(({ size }) => size < 16)
      .map(
        ({ el, size }) =>
          `${el.tagName.toLowerCase()}[name=${el.getAttribute('name') ?? el.id}] ${size}px`,
      ),
  );
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the floor applies below 768px');
});

test('MOB-01 every visible text is at least 12px', async ({ page }) => {
  expect(await auditPages(page, smallText)).toEqual([]);
});

test('MOB-03 every field renders at 16px or more', async ({ page }) => {
  expect(await auditPages(page, smallFields)).toEqual([]);
});
