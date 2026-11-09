import { expect, test } from './base';
import files from '../fixtures/content/press.json' with { type: 'json' };

test('band downloads keep the presentation separate from show specifications and publicity', async ({
  page,
}) => {
  await page.goto('downloads/#downloads');
  await expect(page.locator('[data-download-group]')).toHaveCount(3);
  for (const category of ['apresentacao', 'tecnico', 'divulgacao']) {
    const group = page.locator(`[data-download-group="${category}"]`);
    const expected = files.filter((file) => file.categoria === category);
    await expect(group.locator('[data-press-file]')).toHaveCount(expected.length);
    await expect(group.getByRole('button', { name: 'Em breve', exact: true })).toHaveCount(
      expected.filter((file) => !file.disponivel).length,
    );
    expect(
      (
        await group
          .locator('a[download]')
          .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
      ).sort(),
    ).toEqual(
      expected
        .filter((file) => file.disponivel)
        .map((file) => `/${file.arquivo}`)
        .sort(),
    );
  }
});

test('the optional complete ZIP uses the configured package download', async ({ page }) => {
  await page.goto('downloads/');
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
  await expect(page).toHaveURL(/\/downloads\/#especificacoes-shows$/);
  const technical = page.locator('#especificacoes-shows');
  await expect(technical).toBeInViewport();
  await expect(technical.locator('[data-press-file]')).toHaveCount(1);
});
