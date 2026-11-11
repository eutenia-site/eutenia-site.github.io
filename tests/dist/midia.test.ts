import { describe, expect, test } from 'vitest';
import files from '../../src/content/data/press.json' with { type: 'json' };
import photos from '../../src/content/data/photos.json' with { type: 'json' };
import stats from '../../src/content/data/stats.json' with { type: 'json' };
import { statValue } from '../../src/lib/stats';
import { anchors, readPage, textOf } from './html';
const html = readPage('midia/index.html');
describe('Mídia', () => {
  test('contractor statistics use the same values and order as the homepage', () => {
    const group = /<section[^>]*data-download-group="contratantes"[\s\S]*?<\/section>/.exec(
      html,
    )![0];
    const row = /<dl\b[^>]*data-stats[\s\S]*?<\/dl>/.exec(group);
    if (!stats.length) {
      expect(row).toBeNull();
      return;
    }
    expect(row).not.toBeNull();
    expect(
      [...row![0].matchAll(/<dd\b[^>]*\bdata-stat="[^"]*"[^>]*>([\s\S]*?)<\/dd>/g)].map((m) =>
        textOf(m[1]),
      ),
    ).toEqual(stats.map((stat) => statValue(stat)));
    expect([...row![0].matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>/g)].map((m) => textOf(m[1]))).toEqual(
      stats.map((stat) => stat.rotulo),
    );
  });
  test('contractor files share one section and only available files have download links', () => {
    const group = /<section[^>]*data-download-group="contratantes"[\s\S]*?<\/section>/.exec(
      html,
    )![0];
    const expected = files.filter((file) => file.categoria !== 'pacote');
    expect([...group.matchAll(/data-press-file/g)]).toHaveLength(expected.length);
    expect(
      anchors(group)
        .filter((link) => /\bdownload\b/.test(link.attrs))
        .map((link) => link.href)
        .sort(),
    ).toEqual(
      expected
        .filter((file) => file.disponivel)
        .map((file) => '/' + file.arquivo)
        .sort(),
    );
    expect(textOf(group)).toContain('Materiais para contratantes');
    expect(html).not.toMatch(/\bdata-download-bundle(?:\s|=|>)/);
    expect(group).not.toMatch(/href="\/placeholders\/midia\//);
  });
  test('the complete package banner follows the cards and stays disabled until configured', () => {
    expect(html).toContain('data-download-bundle-section');
    expect(html.indexOf('data-download-bundle-section')).toBeGreaterThan(
      html.lastIndexOf('data-press-file'),
    );
    const banner = html.slice(
      html.indexOf('data-download-bundle-section'),
      html.indexOf('<section id="fotos"'),
    );
    expect(textOf(banner)).toContain('Pacote completo para contratantes');
    expect(banner).toMatch(/<button[^>]*disabled/);
    expect(textOf(banner)).toContain('Em breve');
  });
  test('photos offer previews and original downloads while wallpapers stay hidden', () => {
    expect(html).toMatch(/<section[^>]*id="fotos"/);
    expect(html).not.toMatch(/id="wallpapers"|href="#wallpapers"/);
    expect([...html.matchAll(/data-photo(?: |>|=)/g)]).toHaveLength(photos.length);
    expect([...html.matchAll(/data-photo-preview="([^"]+)"/g)].map((match) => match[1])).toEqual(
      photos.map((photo) => '/' + photo.imagem),
    );
    for (const photo of photos) {
      expect(html).toContain('src="/' + photo.imagem + '"');
      expect(
        anchors(html).some(
          (link) => link.href === '/' + photo.arquivo && /\bdownload\b/.test(link.attrs),
        ),
      ).toBe(true);
    }
  });
});
