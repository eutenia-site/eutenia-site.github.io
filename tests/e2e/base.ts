import { test as base, type Page } from '@playwright/test';

export { expect, type Page } from '@playwright/test';

/**
 * Fonts load without blocking the first paint, so the layout settles after `load`. Every
 * `page.goto` here waits for the icon stylesheet and the font files before a test measures.
 */
export async function settle(page: Page): Promise<void> {
  try {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('icons-ready'),
      undefined,
      { timeout: 10_000 },
    );
    // The icon face is fetched only once a glyph uses it: ask for it, then wait for all.
    await page.evaluate(async () => {
      await document.fonts.load('24px "Material Symbols Outlined"', 'home');
      await document.fonts.ready;
    });
  } catch {
    /* JavaScript disabled or fonts unreachable: measure what rendered */
  }
}

export const test = base.extend({
  page: async ({ page, javaScriptEnabled }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      // Without JavaScript the icons are shown by the noscript style; nothing to wait for.
      if (javaScriptEnabled !== false) await settle(page);
      return response;
    };
    await use(page);
  },
});
