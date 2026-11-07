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
