import { describe, expect, test } from 'vitest';
import releases from '../../src/content/data/releases.json' with { type: 'json' };
import videos from '../../src/content/data/videos.json' with { type: 'json' };
import pressFiles from '../../src/content/data/press.json' with { type: 'json' };
import { anchors, readPage, textOf } from './html';

const html = readPage('discografia/index.html');
const pandora = releases.find((r) => r.id === 'pandora')!;

/** Outer HTML of the element whose opening tag matches `marker`. */
function element(source: string, marker: RegExp): string {
  const open = marker.exec(source);
  if (!open) return '';
  const tag = /^<(\w+)/.exec(source.slice(open.index))![1];
  let depth = 0;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  re.lastIndex = open.index;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return source.slice(open.index, m.index + m[0].length);
  }
  return '';
}

/** Outer HTML of every direct <li> item of a list. */
function items(list: string): string[] {
  const out: string[] = [];
  const inner = list.replace(/^<[^>]+>/, '');
  let rest = inner;
  for (let at = rest.search(/<li\b/); at !== -1; at = rest.search(/<li\b/)) {
    const li = element(rest.slice(at), /<li\b/);
    out.push(li);
    rest = rest.slice(at + li.length);
  }
  return out;
}

describe('Discografia (dist, real content)', () => {
  test('DISC-03 catalog lists the 7 releases newest first', () => {
    const cards = items(element(html, /<ul\b[^>]*data-catalog/));
    const titles = cards.map((li) => textOf(element(li, /<h3\b/)));
    expect(titles).toEqual([
      'Pandora',
      'Carbonizar',
      'Cego',
      'Meu Fim (feat. Caio MacBeserra)',
      'Espelho',
      'Chymia II',
      'Chymia I',
    ]);
    const expected = [
      ['pandora', 'Álbum', '2024', '11 faixas'],
      ['carbonizar', 'Single', '2023', '1 faixa'],
      ['cego', 'Single', '2019', '1 faixa'],
      ['meu-fim', 'Single', '2018', '1 faixa'],
      ['espelho', 'Single', '2017', '1 faixa'],
      ['chymia-ii', 'EP', '2016', '6 faixas'],
      ['chymia-i', 'EP', '2012', '4 faixas'],
    ];
    cards.forEach((li, i) => {
      const [id, tipo, ano, faixas] = expected[i];
      expect(li, id).toMatch(new RegExp(`^<li\\b[^>]*\\bid="${id}"`));
      expect(li, `${id} cover`).toMatch(/<img\b[^>]*alt="Capa de [^"]+"/);
      const text = textOf(li);
      expect(text, id).toContain(tipo);
      expect(text, id).toContain(ano);
      expect(text, id).toContain(faixas);
    });
  });

  test('DISC-04 featured tracklist in album order with m:ss durations', () => {
    const featured = element(html, /<section\b[^>]*data-featured/);
    expect(textOf(element(featured, /<h3\b/))).toBe('Eutenia — Pandora');
    const tracks = items(element(featured, /<ol\b[^>]*data-tracklist/));
    expect(tracks.map((li) => textOf(element(li, /<span\b[^>]*data-track/)))).toEqual(
      pandora.faixas.map((f) => f.titulo),
    );
    const durations = tracks.map((li) => textOf(element(li, /<span\b[^>]*data-duration/)));
    expect(durations[0]).toBe('4:04'); // Indestrutível, 244 s
    expect(durations).toEqual([
      '4:04',
      '3:38',
      '3:29',
      '3:26',
      '4:08',
      '4:55',
      '3:56',
      '3:58',
      '5:10',
      '3:54',
      '4:08',
    ]);
  });

  test('DISC-06 lyrics block omitted without lyrics', () => {
    expect('letraPrevia' in pandora).toBe(false);
    expect(html).not.toMatch(/data-lyrics/);
    expect(textOf(html)).not.toMatch(/Prévia da letra/i);
  });

  test('DISC-01 featured play links the Pandora album and press kit downloads the presentation', () => {
    const featured = element(html, /<section\b[^>]*data-featured/);
    const play = anchors(featured).find((a) => a.attrs.includes('data-featured-play'));
    expect(play?.href).toBe('https://open.spotify.com/album/0Qp2QgxhbqlBWNsLvXxGx1');
    expect(play!.attrs).toMatch(/target="_blank"/);
    const press = anchors(featured).find((a) => /Press kit/i.test(a.text));
    const presentation = pressFiles.find((file) => file.categoria === 'apresentacao')!;
    expect(press?.href).toBe(`/${presentation.arquivo}`);
    expect(press?.attrs).toMatch(/\bdownload\b/);
    expect(readPage('downloads/index.html')).toMatch(/<section\b[^>]*id="press-kit"/);
    // Real products have no purchase link yet: the mobile promo offers no purchase.
    const promo = element(html, /<section\b[^>]*data-merch-promo/);
    expect(promo).toMatch(/<button\b[^>]*disabled[^>]*>\s*Em breve/);
    expect(anchors(promo)).toEqual([]);
  });

  test('DISC-07 lists only official clips, newest first', () => {
    const list = items(element(html, /<ul\b[^>]*data-videos/));
    expect(list).toHaveLength(6);
    expect(list).toHaveLength(videos.length);
    expect(videos.every((v) => v.oficial)).toBe(true);
    const titles = list.map((li) => textOf(element(li, /<h3\b/)));
    expect(titles).toEqual([
      'EUTENIA - INDESTRUTÍVEL [Clipe Oficial]',
      'EUTENIA - CARBONIZAR [Clipe Oficial]',
      'EUTENIA - Cego (Clipe Oficial)',
      'EUTENIA - MEU FIM feat. Caio MacBeserra (Project46) (CLIPE OFICIAL)',
      'Eutenia - They Wanna Watch Me Fall (Clipe Oficial)',
      'Eutenia - Últimas Palavras (Clipe Oficial)',
    ]);
    expect(new Set(titles)).toEqual(new Set(videos.map((v) => v.titulo)));
    for (const li of list) {
      // Each loads the player only on activation: a link with a thumbnail, no iframe.
      expect(li).toMatch(/data-lazy-youtube="[^"]+"/);
      expect(li).not.toMatch(/<iframe\b/);
      expect(anchors(li)[0].href).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
    }
  });

  test('DISC-08 streaming links only for present platforms', () => {
    expect(Object.keys(pandora.links).sort()).toEqual(['deezer', 'spotify']);
    const block = element(html, /<div\b[^>]*data-streaming/);
    const links = anchors(block);
    expect(links.map((a) => [a.text, a.href])).toEqual([
      ['Spotify', pandora.links.spotify],
      ['Deezer', pandora.links.deezer],
    ]);
    expect(textOf(block)).not.toMatch(/Apple Music|Tidal|YouTube Music/);
    expect(pandora.links.spotify).toBe('https://open.spotify.com/album/0Qp2QgxhbqlBWNsLvXxGx1');

    // Only Pandora and Chymia II have a Spotify album link; the other cards link no Spotify page.
    const spotifyIds = releases.filter((r) => 'spotify' in r.links).map((r) => r.id);
    expect(spotifyIds.sort()).toEqual(['chymia-ii', 'pandora']);
    const cards = items(element(html, /<ul\b[^>]*data-catalog/));
    expect(cards).toHaveLength(releases.length);
    for (const li of cards) {
      const id = /\bid="([^"]*)"/.exec(li)![1];
      const release = releases.find((r) => r.id === id)!;
      // A card has one play link per breakpoint (mobile cover button, desktop row): same target.
      const spotifyHrefs = [
        ...new Set(
          anchors(li)
            .map((a) => a.href)
            .filter((h) => h.includes('open.spotify.com')),
        ),
      ];
      const spotify = (release.links as Record<string, string>).spotify;
      if (spotify) {
        expect(spotify, id).toMatch(/^https:\/\/open\.spotify\.com\/album\//);
        expect(spotifyHrefs, id).toEqual([spotify]);
      } else {
        expect(spotifyHrefs, id).toEqual([]);
      }
    }
  });
});
