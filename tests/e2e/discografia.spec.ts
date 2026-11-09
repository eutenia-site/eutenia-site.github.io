import { expect, test } from './base';
import videoData from '../fixtures/content/videos.json' with { type: 'json' };

// Fixtures: 8 releases, 3 official clips, and 9 audio tracks that must stay hidden.
const SINGLES = ['Carbonizar', 'Cego', 'Meu Fim (feat. Caio MacBeserra)', 'Espelho'];
const OFFICIAL_VIDEOS = videoData.filter((v) => v.oficial);

test('DISC-05 filter shows only its kind and sets aria-pressed', async ({ page }) => {
  await page.goto('discografia/');
  const bar = page.getByRole('group', { name: 'Filtrar por tipo' });
  const featured = page.locator('[data-featured]');
  const status = page.locator('[data-filter-status]');
  await expect(featured).toBeVisible();
  await expect(status).toHaveText(`${8 + OFFICIAL_VIDEOS.length} resultados · Todos`);
  await expect(bar.getByRole('button')).toHaveText([
    'Todos',
    'Álbuns & EPs',
    'Singles',
    'Videoclipes',
    'Ao vivo',
  ]);
  const releases = page.locator('[data-release]:visible');
  const videos = page.locator('[data-video]:visible');
  await expect(releases).toHaveCount(8);
  await expect(videos).toHaveCount(OFFICIAL_VIDEOS.length);
  await expect(videos.locator('[data-video-title]')).toHaveText(
    OFFICIAL_VIDEOS.map((v) => v.titulo),
  );

  const singles = bar.getByRole('button', { name: 'Singles' });
  await singles.click();
  await expect(singles).toHaveAttribute('aria-pressed', 'true');
  await expect(bar.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  await expect(releases.locator('h3')).toHaveText(SINGLES);
  await expect(featured).toBeHidden();
  await expect(status).toHaveText('4 resultados · Singles');
  await expect(page.locator('[data-filter-count]')).toHaveText('4 títulos');
  await expect(page.locator('#catalogo-titulo')).toBeInViewport();
  await expect(videos).toHaveCount(0);

  const albums = bar.getByRole('button', { name: 'Álbuns & EPs' });
  await albums.click();
  await expect(albums).toHaveAttribute('aria-pressed', 'true');
  await expect(singles).toHaveAttribute('aria-pressed', 'false');
  await expect(releases.locator('h3')).toHaveText(['Pandora', 'Chymia II', 'Chymia I']);
  await expect(featured).toBeHidden();
  await expect(status).toHaveText('3 resultados · Álbuns & EPs');
  await expect(page.locator('[data-filter-count]')).toHaveText('3 títulos');

  const clips = bar.getByRole('button', { name: 'Videoclipes' });
  await clips.click();
  await expect(clips).toHaveAttribute('aria-pressed', 'true');
  await expect(releases).toHaveCount(0);
  await expect(videos).toHaveCount(OFFICIAL_VIDEOS.length);
  await expect(featured).toBeHidden();
  await expect(status).toHaveText(`${OFFICIAL_VIDEOS.length} resultados · Videoclipes`);
  await expect(page.locator('#videos-titulo')).toBeInViewport();
  await expect(
    page.getByRole('heading', { name: 'Catálogo completo de lançamentos' }),
  ).toBeHidden();

  await bar.getByRole('button', { name: 'Ao vivo' }).click();
  await expect(releases.locator('h3')).toHaveText(['Ao Vivo Fixture']);
  await expect(status).toHaveText('1 resultado · Ao vivo');
  await expect(page.locator('[data-filter-count]')).toHaveText('1 título');

  await bar.getByRole('button', { name: 'Todos' }).click();
  await expect(releases).toHaveCount(8);
  await expect(videos).toHaveCount(OFFICIAL_VIDEOS.length);
  await expect(featured).toBeVisible();
  await expect(page.locator('#destaque-titulo')).toBeInViewport();
  await expect(status).toHaveText(`${8 + OFFICIAL_VIDEOS.length} resultados · Todos`);
  await expect(page.locator('[data-filter-count]')).toHaveText('8 títulos');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-09 without JavaScript all releases and videos show and filters hide', async ({
    page,
  }) => {
    await page.goto('discografia/');
    await expect(page.locator('[data-release]:visible')).toHaveCount(8);
    await expect(page.locator('[data-video]:visible')).toHaveCount(OFFICIAL_VIDEOS.length);
    await expect(page.locator('[data-filter-bar]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Singles' })).toHaveCount(0);
    // The share button needs a script: without one it stays hidden.
    await expect(page.locator('[data-share]').first()).toBeHidden();
  });
});

test('DISC-01 featured cover, Spotify play, press kit and lyrics preview', async ({ page }) => {
  await page.goto('discografia/');
  const featured = page.locator('[data-featured]');

  // The cover sits at the top of its column.
  const column = (await featured.locator('[data-featured-cover]').boundingBox())!;
  const cover = (await featured.locator('[data-featured-cover] > div').first().boundingBox())!;
  expect(cover.y - column.y).toBeLessThanOrEqual(48);

  // Square play button on the cover opens the release on Spotify in a new tab.
  const play = featured.locator('[data-featured-play]');
  await expect(play).toHaveAccessibleName('Ouvir Pandora no Spotify (abre em nova aba)');
  await expect(play).toHaveAttribute(
    'href',
    'https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM',
  );
  await expect(play).toHaveAttribute('target', '_blank');
  await expect(play).toHaveCSS('border-radius', '0px');

  // Press kit downloads the band presentation, rather than opening technical documents.
  const pressKit = featured.getByRole('link', { name: /Press kit/i });
  await expect(pressKit).toHaveAttribute('href', '/downloads/eutenia-press-kit-2020.pdf');
  const [download] = await Promise.all([page.waitForEvent('download'), pressKit.click()]);
  expect(download.suggestedFilename()).toBe('eutenia-press-kit-2020.pdf');

  // The fixtures' featured release has lyrics: the preview block renders.
  await page.goto('discografia/');
  const lyrics = page.locator('[data-lyrics]');
  await expect(lyrics).toBeVisible();
  await expect(lyrics).toContainText('Prévia da letra: "Pandora"');
  await expect(lyrics).toContainText('Primeira linha da prévia de teste');
});

test('DISC-02 mobile merch promo shows the first featured product', async ({ page }, testInfo) => {
  await page.route('https://loja.exemplo.com/**', (route) =>
    route.fulfill({ body: 'Checkout de teste' }),
  );
  await page.goto('discografia/');
  const promo = page.locator('[data-merch-promo]');
  if (testInfo.project.name !== 'mobile') {
    await expect(promo).toBeHidden();
    return;
  }
  await expect(promo).toBeVisible();
  await expect(promo.getByRole('heading')).toHaveText('Camiseta Teste');
  await expect(promo).toContainText('R$ 119,90');
  await expect(promo.locator('img')).toHaveAttribute('src', /\.(jpe?g|png|webp)$/);
  const buy = promo.getByRole('link', { name: /Comprar Camiseta Teste/ });
  await expect(buy).toHaveAttribute('href', 'https://loja.exemplo.com/camiseta');
  await expect(buy).not.toHaveAttribute('target', '_blank');
  await buy.click();
  await expect(page).toHaveURL('https://loja.exemplo.com/camiseta');
});

test('DISC-01 lyrics preview collapses with Recolher and expands again', async ({ page }) => {
  await page.goto('discografia/');
  const lyrics = page.locator('[data-lyrics]');
  const line = lyrics.getByText('Primeira linha da prévia de teste');
  await expect(line).toBeVisible();
  const toggle = lyrics.locator('summary');
  await expect(toggle).toContainText('Recolher');
  await toggle.click();
  await expect(line).toBeHidden();
  await expect(toggle).toContainText('Expandir');
  await toggle.click();
  await expect(line).toBeVisible();
});

test('DISC-03 catalog card actions: desktop OUVIR / TRACKLIST, mobile play over the cover', async ({
  page,
}, testInfo) => {
  await page.goto('discografia/');
  const card = page.locator('[data-release]').first();
  const desktopAction = card.getByRole('link', { name: /Ouvir \/ Tracklist/i });
  const play = card.locator('[data-mobile-play]');
  if (testInfo.project.name === 'mobile') {
    await expect(desktopAction).toBeHidden();
    await expect(play).toBeVisible();
    await expect(play).toHaveAccessibleName(/^Ouvir .+ \(abre em nova aba\)$/);
    await expect(card.locator('[data-mobile-type]')).toBeVisible();
    // The play button sits over the cover's bottom-right corner.
    const cover = (await play.locator('xpath=..').boundingBox())!;
    const p = (await play.boundingBox())!;
    expect(p.x + p.width).toBeLessThanOrEqual(cover.x + cover.width);
    expect(p.y + p.height).toBeLessThanOrEqual(cover.y + cover.height);
    expect(p.x).toBeGreaterThan(cover.x + cover.width / 2);
  } else {
    await expect(play).toBeHidden();
    await expect(desktopAction).toBeVisible();
    await expect(desktopAction).toHaveAttribute('target', '_blank');
  }
});

test('DISC-07 mobile video card share copies the watch link', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'share icon is drawn on mobile only');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    // Force the copy path: Chromium headless has no share sheet.
    Object.defineProperty(navigator, 'share', { value: undefined });
  });
  await page.goto('discografia/');
  const video = page.locator('[data-video]').first();
  const share = video.getByRole('button', { name: /^Compartilhar / });
  await expect(share).toBeVisible();
  await share.click();
  await expect(video.locator('[data-share-status]')).toHaveText('Link copiado');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
});
