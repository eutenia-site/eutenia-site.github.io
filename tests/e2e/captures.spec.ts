import { test, type Page } from '@playwright/test';

/**
 * Saves `<capture>.running.png` beside each binding capture, from a browser window at the
 * capture's width (desktop 1280, mobile 390), for the screens sub-agent to judge.
 * Page tasks add their entries to CAPTURES.
 */
const CAPTURES: { name: string; route: string }[] = [
  { name: 'inicio', route: './' },
  { name: 'mobile-inicio', route: './' },
];

const DIR = '.specs/features/site-v0/captures';
const WIDTH = { desktop: 1280, mobile: 390 } as const;

async function saveCapture(page: Page, route: string, name: string) {
  const mobile = name.startsWith('mobile-');
  await page.setViewportSize({ width: mobile ? WIDTH.mobile : WIDTH.desktop, height: 900 });
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
        // A lazy image inside a display:none box never loads; it is not in the picture either.
        img.complete || !img.checkVisibility()
          ? null
          : new Promise((r) => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
            }),
      ),
    );
  });
  await page.screenshot({ path: `${DIR}/${name}.running.png`, fullPage: true });
}

for (const { name, route } of CAPTURES) {
  test(`capture ${name}`, async ({ page }, testInfo) => {
    const project = name.startsWith('mobile-') ? 'mobile' : 'desktop';
    test.skip(testInfo.project.name !== project, `${name} is taken in the ${project} project`);
    await saveCapture(page, route, name);
  });
}
