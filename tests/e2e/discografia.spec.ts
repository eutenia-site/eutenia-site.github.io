import { expect, test } from '@playwright/test';

// Fixtures: 8 releases (album, 2 EPs, 4 singles, 1 ao-vivo) and 11 videos.
const SINGLES = ['Carbonizar', 'Cego', 'Meu Fim (feat. Caio MacBeserra)', 'Espelho'];

test('DISC-05 filter shows only its kind and sets aria-pressed', async ({ page }) => {
  await page.goto('discografia/');
  const bar = page.getByRole('group', { name: 'Filtrar por tipo' });
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
  await expect(videos).toHaveCount(11);

  const singles = bar.getByRole('button', { name: 'Singles' });
  await singles.click();
  await expect(singles).toHaveAttribute('aria-pressed', 'true');
  await expect(bar.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  await expect(releases.locator('h3')).toHaveText(SINGLES);
  await expect(videos).toHaveCount(0);

  const albums = bar.getByRole('button', { name: 'Álbuns & EPs' });
  await albums.click();
  await expect(albums).toHaveAttribute('aria-pressed', 'true');
  await expect(singles).toHaveAttribute('aria-pressed', 'false');
  await expect(releases.locator('h3')).toHaveText(['Pandora', 'Chymia II', 'Chymia I']);

  const clips = bar.getByRole('button', { name: 'Videoclipes' });
  await clips.click();
  await expect(clips).toHaveAttribute('aria-pressed', 'true');
  await expect(releases).toHaveCount(0);
  await expect(videos).toHaveCount(11);
  await expect(
    page.getByRole('heading', { name: 'Catálogo completo de lançamentos' }),
  ).toBeHidden();

  await bar.getByRole('button', { name: 'Ao vivo' }).click();
  await expect(releases.locator('h3')).toHaveText(['Ao Vivo Fixture']);

  await bar.getByRole('button', { name: 'Todos' }).click();
  await expect(releases).toHaveCount(8);
  await expect(videos).toHaveCount(11);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-09 without JavaScript all releases and videos show and filters hide', async ({
    page,
  }) => {
    await page.goto('discografia/');
    await expect(page.locator('[data-release]:visible')).toHaveCount(8);
    await expect(page.locator('[data-video]:visible')).toHaveCount(11);
    await expect(page.locator('[data-filter-bar]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Singles' })).toHaveCount(0);
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

  // Press kit leads to the press section on Contato.
  const pressKit = featured.getByRole('link', { name: /Press kit/i });
  await expect(pressKit).toHaveAttribute('href', '/eutenia-site/contato/#press-kit');
  await pressKit.click();
  await expect(page).toHaveURL(/\/contato\/#press-kit$/);
  await expect(page.locator('#press-kit')).toBeInViewport();

  // The fixtures' featured release has lyrics: the preview block renders.
  await page.goto('discografia/');
  const lyrics = page.locator('[data-lyrics]');
  await expect(lyrics).toBeVisible();
  await expect(lyrics).toContainText('Prévia da letra: "Pandora"');
  await expect(lyrics).toContainText('Primeira linha da prévia de teste');
});

test('DISC-02 mobile merch promo shows the first featured product', async ({ page }, testInfo) => {
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
  await expect(buy).toHaveAttribute('target', '_blank');
});
