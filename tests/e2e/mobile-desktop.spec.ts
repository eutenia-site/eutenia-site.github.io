import { expect, test } from './base';

/**
 * MOB-04: mobile-v1 changes only what renders below 768px. At 1280 each page must match the
 * site-v0 picture frozen in `baselines/` (copied from `.specs/features/site-v0/captures/`,
 * or shot at e110322 for the pages site-v0 has no picture of),
 * up to 0.01% differing pixels. The page is shot exactly as `captures.spec.ts` shoots it.
 */
const PAGES = [
  { name: 'inicio', route: './' },
  { name: 'discografia', route: 'discografia/' },
  { name: 'shows', route: 'shows/' },
  { name: 'loja', route: 'loja/' },
  { name: 'fas', route: 'fas/' },
  { name: 'contato', route: 'contato/' },
  // No site-v0 picture: shot at e110322 (before mobile-v1) from the fixtures build, same steps.
  { name: 'privacidade', route: 'privacidade/' },
  { name: 'nao-existe', route: 'nao-existe/' },
];

test.describe('MOB-04 desktop pages match site-v0 pictures', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'the site-v0 pictures are 1280 wide');
  });

  for (const { name, route } of PAGES) {
    test(name, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(route, { waitUntil: 'networkidle' });
      // Scroll through the page so lazy images load, then back to the top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((img) =>
            img.complete || !img.checkVisibility()
              ? null
              : new Promise((r) => {
                  img.addEventListener('load', r, { once: true });
                  img.addEventListener('error', r, { once: true });
                }),
          ),
        );
      });
      const shot = await page.screenshot({ fullPage: true });
      // threshold 0: any colour change counts as a differing pixel, not only a large one.
      expect(shot).toMatchSnapshot(`${name}.png`, { maxDiffPixelRatio: 0.0001, threshold: 0 });
    });
  }
});
