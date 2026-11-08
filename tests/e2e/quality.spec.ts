import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from './base';

/** Every page of the site, plus an unknown path that serves the 404 page. */
const PAGES = [
  { name: 'Início', route: './' },
  { name: 'Discografia', route: 'discografia/' },
  { name: 'Shows', route: 'shows/' },
  { name: 'Loja', route: 'loja/' },
  { name: 'Fãs', route: 'fas/' },
  { name: 'Contato', route: 'contato/' },
  { name: 'Privacidade', route: 'privacidade/' },
  { name: '404', route: 'pagina-que-nao-existe/' },
];

/** Void token from src/styles/global.css (--color-void: #0a0b0e). */
const VOID = 'rgb(10, 11, 14)';

const INTERACTIVE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex^="-"])';

async function open(page: Page, route: string) {
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
}

test('QUAL-01 tokens applied: background, fonts, zero radius', async ({ page }) => {
  let paragraphs = 0;
  for (const { name, route } of PAGES) {
    await open(page, route);
    const styles = await page.evaluate(() => {
      const css = (el: Element) => getComputedStyle(el);
      const main = document.querySelector('main')!;
      const visible = (el: Element) => el.checkVisibility();
      // Body text: prose paragraphs (uppercase labels use the display font by design).
      const text = [...main.querySelectorAll('p')].filter(
        (p) =>
          visible(p) &&
          css(p).textTransform !== 'uppercase' &&
          (p.textContent ?? '').trim().length > 40,
      );
      return {
        background: css(document.body).backgroundColor,
        bodyFont: css(document.body).fontFamily,
        paragraphCount: text.length,
        paragraphFonts: [...new Set(text.map((p) => css(p).fontFamily))],
        h1Fonts: [...document.querySelectorAll('h1')].map((h) => css(h).fontFamily),
        sectionH2Fonts: [...main.querySelectorAll('section h2, h2')]
          .filter(visible)
          .map((h) => css(h).fontFamily),
        squareRadii: [
          ...main.querySelectorAll('button, article, [data-product], [data-show], form'),
          ...document.querySelectorAll('header a, header button'),
        ]
          // Pills (.rounded-pill) are the one exception: badges and the mobile show chips.
          .filter((el) => visible(el) && !el.classList.contains('rounded-pill'))
          .map((el) => ({ el: el.outerHTML.slice(0, 80), radius: css(el).borderRadius }))
          .filter((r) => r.radius !== '0px'),
        pillRadii: [...document.querySelectorAll('span.rounded-pill')]
          .filter(visible)
          .map((el) => css(el).borderRadius),
      };
    });
    expect(styles.background, name).toBe(VOID);
    expect(styles.bodyFont, name).toMatch(/^"?Plus Jakarta Sans"?,/);
    paragraphs += styles.paragraphCount;
    for (const font of styles.paragraphFonts) expect(font, name).toMatch(/^"?Plus Jakarta Sans"?,/);
    expect(styles.h1Fonts, name).toHaveLength(1);
    expect(styles.h1Fonts[0], name).toMatch(/^"?Oswald"?,/);
    for (const font of styles.sectionH2Fonts) expect(font, name).toMatch(/^"?Oswald"?,/);
    expect(styles.squareRadii, name).toEqual([]);

    // Spacing: the page side gutter is DESIGN.md margin-sm (1rem) on phones and margin-lg (4rem)
    // from 768px up. Text in the header and in main starts at the gutter, never closer to the edge.
    const width = page.viewportSize()!.width;
    const gutter = width < 768 ? 16 : 64;
    const edges = await page.evaluate(() => {
      const boxes = [
        ...document.querySelectorAll(
          'header a, main h1, main h2, main h3, main p, main li, main label, main form',
        ),
      ]
        .filter((el) => el.checkVisibility())
        .map((el) => el.getBoundingClientRect())
        // Cards of a horizontal scroll row that peek past the right edge are not page text.
        .filter((r) => r.width > 0 && r.height > 0 && r.right <= window.innerWidth);
      return {
        left: Math.min(...boxes.map((r) => r.left)),
        right: Math.max(...boxes.map((r) => r.right)),
        scroll: document.documentElement.scrollWidth,
      };
    });
    expect(Math.round(edges.left), `${name} left gutter`).toBe(gutter);
    expect(Math.round(width - edges.right), `${name} right gutter`).toBe(gutter);
    expect(edges.scroll, `${name} has no horizontal page scroll`).toBeLessThanOrEqual(width);
    for (const radius of styles.pillRadii) expect(radius, name).toBe('9999px');
  }
  expect(paragraphs).toBeGreaterThan(5);
  // Show status badges are pills; product cards are square.
  await open(page, 'shows/');
  const badge = page.locator('[data-show] span.rounded-pill').first();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS('border-radius', '9999px');
  await open(page, 'loja/');
  await expect(page.locator('[data-product]').first()).toHaveCSS('border-radius', '0px');
});

test('QUAL-02 no serious or critical axe violations', async ({ page }) => {
  for (const { name, route } of PAGES) {
    await open(page, route);
    const { violations } = await new AxeBuilder({ page }).analyze();
    // The iframe element itself is checked (title); nodes inside a frame (target path longer
    // than one) belong to the third-party Spotify/YouTube documents, not to this site.
    const blocking = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.filter((n) => n.target.length === 1).map((n) => n.target.join(' ')),
      }))
      .filter((v) => v.nodes.length > 0);
    expect(blocking, `${name}: ${JSON.stringify(blocking, null, 2)}`).toEqual([]);
  }
});

test('QUAL-03 every control reachable by keyboard with visible focus', async ({ page }) => {
  test.setTimeout(120_000);
  for (const { name, route } of PAGES) {
    await open(page, route);
    // Number every visible, enabled interactive element; a radio group is one stop.
    const expected = await page.evaluate((selector) => {
      const radios = new Set<string>();
      let n = 0;
      for (const el of document.querySelectorAll<HTMLElement>(selector)) {
        // tabindex="-1" leaves the Tab sequence by design (roving tabs: arrow keys move focus).
        if (el.tabIndex < 0) continue;
        if (!el.checkVisibility({ visibilityProperty: true }) || el.closest('[inert]')) continue;
        if (el instanceof HTMLInputElement && el.type === 'radio') {
          if (radios.has(el.name)) continue;
          radios.add(el.name);
          for (const r of document.querySelectorAll(`input[type=radio][name="${el.name}"]`))
            r.setAttribute('data-q3', String(n));
        } else el.setAttribute('data-q3', String(n));
        n++;
      }
      return n;
    }, INTERACTIVE);
    expect(expected, name).toBeGreaterThan(0);

    const reached = new Map<string, string>();
    await page.locator('body').focus();
    for (let i = 0; i < expected * 3 + 50; i++) {
      await page.keyboard.press('Tab');
      const hit = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const id = el?.getAttribute('data-q3');
        if (!el || id == null) return null;
        const s = getComputedStyle(el);
        return {
          id,
          style: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} | ${s.boxShadow}`,
        };
      });
      if (hit && !reached.has(hit.id)) reached.set(hit.id, hit.style);
      if (reached.size === expected) break;
    }
    const missed = await page.evaluate(
      (ids) =>
        [...document.querySelectorAll('[data-q3]')]
          .filter((el) => !ids.includes(el.getAttribute('data-q3')!))
          .map((el) => el.outerHTML.slice(0, 120)),
      [...reached.keys()],
    );
    expect(missed, `${name}: not reached by Tab`).toEqual([]);

    // Each focused style must differ from the same element's unfocused style.
    const noIndicator = await page.evaluate((focused) => {
      (document.activeElement as HTMLElement | null)?.blur();
      return Object.entries(focused)
        .map(([id, style]) => {
          const el = document.querySelector(`[data-q3="${id}"]`)!;
          const s = getComputedStyle(el);
          const rest = `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} | ${s.boxShadow}`;
          const visible = !style.startsWith('none') || !style.endsWith('| none');
          return rest === style || !visible ? el.outerHTML.slice(0, 120) : null;
        })
        .filter(Boolean);
    }, Object.fromEntries(reached));
    expect(noIndicator, `${name}: no visible focus indicator`).toEqual([]);
  }
});

test('QUAL-05 without JavaScript every page shows content and links', async ({
  browser,
}, testInfo) => {
  const mobile = testInfo.project.name === 'mobile';
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    baseURL: testInfo.project.use.baseURL,
  });
  const page = await context.newPage();
  const navLinks = ['Início', 'Discografia', 'Shows', 'Loja', 'Fãs', 'Contato'];
  for (const { name, route } of PAGES) {
    await page.goto(route);
    await expect(page.locator('h1'), name).toBeVisible();
    const nav = mobile
      ? page.getByRole('navigation', { name: 'Barra de navegação' })
      : page.getByRole('navigation', { name: 'Principal' });
    await expect(nav, name).toBeVisible();
    const footer = page.locator('footer');
    for (const label of navLinks)
      await expect(footer.getByRole('link', { name: label, exact: true }), name).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Política de Privacidade' }), name).toBeVisible();
  }

  const listed = async (route: string, selector: string, min: number) => {
    await page.goto(route);
    const visible = page.locator(`${selector}:visible`);
    expect(await visible.count(), `${route} ${selector}`).toBeGreaterThanOrEqual(min);
    expect(await visible.count()).toBe(await page.locator(selector).count());
  };
  await listed('discografia/', '[data-disc-list] > *', 2);
  await listed('discografia/', '[data-video]', 1);
  await listed('loja/', '[data-product]', 7);
  await listed('fas/', '[data-wallpaper]', 1);
  await listed('shows/', '[data-show-list] [data-show]', 1);
  await page.goto('contato/');
  await expect(page.locator('form[data-contact-form]')).toBeVisible();
  await expect(page.locator('a[href^="mailto:contato@eutenia.com.br"]').first()).toBeVisible();
  await page.goto('./');
  await expect(page.getByRole('link', { name: /Ouvir no Spotify/i }).first()).toBeVisible();
  await context.close();
});
