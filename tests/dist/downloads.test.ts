import { describe, expect, test } from 'vitest';
import files from '../../src/content/data/press.json' with { type: 'json' };
import photos from '../../src/content/data/photos.json' with { type: 'json' };
import { anchors, readPage, textOf } from './html';
const html = readPage('midia/index.html');
describe('Mídia', () => {
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
    expect(html).not.toContain('data-download-bundle');
    expect(group).not.toMatch(/href="\/placeholders\/downloads\//);
  });
  test('photos offer previews and original downloads while wallpapers stay hidden', () => {
    expect(html).toMatch(/<section[^>]*id="fotos"/);
    expect(html).not.toMatch(/id="wallpapers"|href="#wallpapers"/);
    expect([...html.matchAll(/data-photo(?: |>|=)/g)]).toHaveLength(photos.length);
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
