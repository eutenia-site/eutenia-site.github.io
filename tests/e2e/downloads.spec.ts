import { expect, test } from './base';
import files from '../fixtures/content/press.json' with { type: 'json' };

test('media groups contractor downloads and offers photos without wallpapers', async ({ page }) => {
  await page.goto('midia/');
  await expect(page.locator('[data-download-group]')).toHaveCount(1);
  const group = page.locator('#materiais-contratantes');
  const expected = files.filter((file) => file.categoria !== 'pacote');
  await expect(group.locator('[data-press-file]')).toHaveCount(expected.length);
  for (const file of expected) {
    const card = group
      .locator('[data-press-file]')
      .filter({ has: page.getByRole('heading', { name: file.titulo, exact: true }) });
    if (file.disponivel)
      await expect(card.locator('a[download]')).toHaveAttribute('href', '/' + file.arquivo);
    else await expect(card.getByRole('button', { name: 'Em breve' })).toBeDisabled();
  }
  await expect(page.locator('#fotos [data-photo]')).toHaveCount(1);
  await expect(page.locator('#wallpapers')).toHaveCount(0);
  await expect(page.locator('a[href="#wallpapers"]')).toHaveCount(0);
  const photo = page.locator('#fotos a[download]').first();
  const [download] = await Promise.all([page.waitForEvent('download'), photo.click()]);
  expect(download.suggestedFilename()).toBe('hero-palco.jpg');
});

test('the optional complete ZIP uses the configured package download', async ({ page }) => {
  await page.goto('midia/');
  const bundle = files.find((file) => file.categoria === 'pacote')!;
  const link = page.locator('[data-download-bundle]');
  await expect(link).toHaveAttribute('href', `/${bundle.arquivo}`);
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe(bundle.arquivo.split('/').at(-1));
});

test('Shows downloads the press kit and opens the separate technical section', async ({ page }) => {
  await page.goto('shows/#contratar');
  const section = page.locator('#contratar');
  const pressKit = section.getByRole('link', { name: 'Baixar press kit', exact: true });
  const [download] = await Promise.all([page.waitForEvent('download'), pressKit.click()]);
  expect(download.suggestedFilename()).toBe('eutenia-press-kit-2020.pdf');
  await section.getByRole('link', { name: 'Especificações para shows', exact: true }).click();
  await expect(page).toHaveURL(/\/midia\/#materiais-contratantes$/);
  const technical = page.locator('#materiais-contratantes');
  await expect(technical).toBeInViewport();
  await expect(technical.locator('[data-press-file]')).toHaveCount(
    files.filter((file) => file.categoria !== 'pacote').length,
  );
});
