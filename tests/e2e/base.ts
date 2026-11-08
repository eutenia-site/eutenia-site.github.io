import { test as base, type Page } from '@playwright/test';

export { expect, type Page } from '@playwright/test';

/**
 * Fonts load without blocking the first paint, so the layout settles after `load`. Every
 * `page.goto` here waits for the icon stylesheet and the font files before a test measures.
 */
export async function settle(page: Page): Promise<void> {
  await page
    .waitForFunction(
      async () => {
        if (!document.documentElement.classList.contains('icons-ready')) return false;
        await document.fonts.ready;
        return true;
      },
      undefined,
      { timeout: 10_000 },
    )
    .catch(() => {
      /* JavaScript disabled or fonts unreachable: measure what rendered */
    });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await settle(page);
      return response;
    };
    await use(page);
  },
});
