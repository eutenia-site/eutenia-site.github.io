import { test, type Page } from './base';

/**
 * Saves `<capture>.running.png` beside each binding capture, from a browser window at the
 * capture's width (desktop 1280, mobile 390), for the screens sub-agent to judge.
 * Page tasks add their entries to CAPTURES; `dir` is the feature's captures folder.
 * Opt-in: runs only with CAPTURES=1 (`npm run captures`), so a normal e2e run leaves the tree clean.
 */
const SITE_V0 = '.specs/features/site-v0/captures';
const MOBILE_V1 = '.specs/features/mobile-v1/captures';

const CAPTURES: { name: string; route: string; dir: string }[] = [
  { name: 'inicio', route: './', dir: SITE_V0 },
  { name: 'mobile-inicio', route: './', dir: SITE_V0 },
  { name: 'discografia', route: 'discografia/', dir: SITE_V0 },
  { name: 'mobile-discografia', route: 'discografia/', dir: SITE_V0 },
  { name: 'shows', route: 'shows/', dir: SITE_V0 },
  { name: 'mobile-shows', route: 'shows/', dir: SITE_V0 },
  { name: 'contato', route: 'contato/', dir: SITE_V0 },
  { name: 'loja', route: 'loja/', dir: SITE_V0 },
  { name: 'mobile-discografia', route: 'discografia/', dir: MOBILE_V1 },
];

const WIDTH = { desktop: 1280, mobile: 390 } as const;

async function saveCapture(page: Page, route: string, name: string, dir: string) {
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
  await page.screenshot({ path: `${dir}/${name}.running.png`, fullPage: true });
}

test.skip(!process.env.CAPTURES, 'captures run only with CAPTURES=1 (npm run captures)');

for (const { name, route, dir } of CAPTURES) {
  test(`capture ${dir.split('/')[2]}/${name}`, async ({ page }, testInfo) => {
    const project = name.startsWith('mobile-') ? 'mobile' : 'desktop';
    test.skip(testInfo.project.name !== project, `${name} is taken in the ${project} project`);
    await saveCapture(page, route, name, dir);
  });
}
