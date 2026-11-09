import { expect, test } from './base';
import stats from '../fixtures/content/stats.json' with { type: 'json' };

// Fixtures: 6 wallpapers, 4 capas, 1 ao-vivo ("Eutenia ao vivo"), 1 logotipos.
test('FAS-02 wallpaper filter shows only category', async ({ page }) => {
  await page.goto('fas/');
  const cards = page.locator('[data-wallpaper]');
  await expect(cards).toHaveCount(6);
  const visible = page.locator('[data-wallpaper]:visible');
  await expect(visible).toHaveCount(6);

  const aoVivo = page.getByRole('button', { name: 'Ao vivo / palco' });
  await aoVivo.click();
  await expect(aoVivo).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Todos' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute('data-categoria', 'ao-vivo');
  await expect(visible.locator('h3')).toHaveText('Eutenia ao vivo');

  const capas = page.getByRole('button', { name: 'Capas de singles' });
  await capas.click();
  await expect(capas).toHaveAttribute('aria-pressed', 'true');
  await expect(aoVivo).toHaveAttribute('aria-pressed', 'false');
  await expect(visible).toHaveCount(4);
  for (const c of await visible.all()) await expect(c).toHaveAttribute('data-categoria', 'capas');

  await page.getByRole('button', { name: 'Logotipos & vetor' }).click();
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute('data-categoria', 'logotipos');

  await page.getByRole('button', { name: 'Todos' }).click();
  await expect(visible).toHaveCount(6);
});

test('FAS-01 hero stat boxes show every configured label above its value', async ({ page }) => {
  await page.goto('fas/');
  const boxes = page.locator('[data-fas-stats] [data-fas-stat]');
  await expect(boxes).toHaveCount(stats.length);
  for (const [i, { rotulo, valor }] of stats.entries()) {
    const box = boxes.nth(i);
    const dt = box.locator('dt');
    const dd = box.locator('dd');
    await expect(dt).toHaveText(rotulo);
    await expect(dd).toContainText(valor);
    const label = (await dt.boundingBox())!;
    const value = (await dd.boundingBox())!;
    expect(label.y + label.height).toBeLessThanOrEqual(value.y + 1);
  }
});
