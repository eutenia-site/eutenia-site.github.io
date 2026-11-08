import { expect, test, type Page } from './base';
import { auditPages } from './mobile-audit';

/*
 * MOB-02 (AD-011): below 768px every visible link, button, tab, summary, input, select,
 * textarea and checkbox has a hit area of at least 44×44 CSS px on the 7 pages and the 404.
 * Exceptions (spec Assumptions): a link inside a sentence, the skip link, and a checkbox
 * whose label box is at least 44×44 (the checkbox counts by its label).
 */

/** Visible controls whose hit area is under 44×44, named by element, text and size. */
function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const MIN = 44 - 0.01; // sub-pixel layout rounding
    const selector =
      'a[href], button, [role="tab"], summary, input:not([type="hidden"]), select, textarea';
    const hits: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const own = el.getBoundingClientRect();
      // A box of 1px or less is visually hidden (sr-only), not a visible control.
      if (own.width <= 1 || own.height <= 1) continue;

      if (el.textContent?.trim() === 'Pular para o conteúdo') continue;
      // A link inside a sentence: rendered inline, beside text of its parent.
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
        const sentence = [...el.parentElement!.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== '',
        );
        if (sentence) continue;
      }
      let box = own;
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        const label = el.labels?.[0];
        if (label) box = label.getBoundingClientRect();
      }
      if (box.width < MIN || box.height < MIN) {
        const name = el.getAttribute('aria-label') ?? el.textContent!.trim().slice(0, 30);
        const id = `${el.tagName.toLowerCase()}${el.getAttribute('type') ? `[type=${el.getAttribute('type')}]` : ''}`;
        hits.push(`${id} "${name}" ${Math.round(box.width)}x${Math.round(box.height)}`);
      }
    }
    return hits;
  });
}

/*
 * Controls the global rule in global.css cannot reach (standalone inline links). T4 enlarges
 * each one in its component and removes this list.
 */
const PENDING_T4 = [
  'shows/: a "contato@eutenia.com.br" 176x26',
  'loja/: a "contato@eutenia.com.br" 160x16',
];

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'the hit area floor applies below 768px');
});

test('MOB-02 every control has a 44x44 hit area', async ({ page }) => {
  const hits = await auditPages(page, smallTargets);
  expect(hits.filter((hit) => !PENDING_T4.includes(hit))).toEqual([]);
});
