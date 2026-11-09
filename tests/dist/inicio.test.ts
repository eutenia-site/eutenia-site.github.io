import { describe, expect, test } from 'vitest';
import releases from '../../src/content/data/releases.json' with { type: 'json' };
import shows from '../../src/content/data/shows.json' with { type: 'json' };
import stats from '../../src/content/data/stats.json' with { type: 'json' };
import videos from '../../src/content/data/videos.json' with { type: 'json' };
import site from '../../src/config/site.json' with { type: 'json' };
import { showTabs } from '../../src/lib/shows';
import { anchors, decode, readPage, textOf } from './html';

const html = readPage('index.html');
const pandora = releases.find((r) => r.id === 'pandora')!;

/** The outer HTML of the element whose opening tag carries `marker`. */
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

describe('Início (dist, real content)', () => {
  test('HOME-03 hero features Pandora with clip and Spotify actions', () => {
    expect(pandora.destaque).toBe(true);
    const hero = element(html, /<section\b[^>]*id="hero"/);
    expect(hero, 'hero section').not.toBe('');
    expect(textOf(hero)).toMatch(/"Pandora"/);
    expect(textOf(hero)).toMatch(/Álbum 2024/);
    expect(element(hero, /<h1\b/)).toMatch(/Pandora/);

    const links = anchors(hero);
    const clip = links.find((a) => /Assistir clipe oficial/i.test(a.text));
    expect(clip, 'primary clip action').toBeDefined();
    const official = videos.find((v) => v.destaque)!;
    expect(official).toMatchObject({ id: 'Atv4aKAXEmg', oficial: true, releaseId: 'pandora' });
    // Without JavaScript the action opens the official clip on YouTube.
    expect(clip!.href).toBe(`https://www.youtube.com/watch?v=${official.id}`);
    expect(clip!.attrs).toContain(`data-hero-clip="${official.id}"`);
    // With JavaScript it starts the player of the clip section holding the same video.
    const clipSection = element(html, /<section\b[^>]*id="clipe"/);
    expect(clipSection).toContain(`data-lazy-youtube="${official.id}"`);
    expect(anchors(clipSection).map((a) => a.href)).toContain(
      `https://www.youtube.com/watch?v=${official.id}`,
    );

    const spotify = links.find((a) => /Ouvir no Spotify/i.test(a.text));
    expect(spotify, 'OUVIR NO SPOTIFY').toBeDefined();
    // The Pandora album on Spotify, not the artist page.
    expect(pandora.links.spotify).toBe('https://open.spotify.com/album/0Qp2QgxhbqlBWNsLvXxGx1');
    expect(spotify!.href).toBe('https://open.spotify.com/album/0Qp2QgxhbqlBWNsLvXxGx1');
    expect(spotify!.attrs).toMatch(/target="_blank"/);
    expect(spotify!.attrs).toMatch(/rel="noopener"/);
  });

  test('HOME-01 hero description comes from the release data', () => {
    const hero = element(html, /<section\b[^>]*id="hero"/);
    expect(pandora.descricao).toMatch(/^Pandora, o álbum de 2024/);
    expect(textOf(hero)).toContain(pandora.descricao!);
  });

  test('HOME-04 compact Spotify embed of featured release', () => {
    const player = element(html, /<section\b[^>]*id="player"/);
    expect(player, 'player section').not.toBe('');
    const iframes = [...player.matchAll(/<iframe\b([^>]*)>/g)].map((m) => m[1]);
    expect(iframes).toHaveLength(1);
    expect(decode(/\bsrc="([^"]*)"/.exec(iframes[0])![1])).toBe(
      'https://open.spotify.com/embed/album/0Qp2QgxhbqlBWNsLvXxGx1',
    );
    expect(iframes[0]).toMatch(/\bheight="80"/);
    expect(iframes[0]).toMatch(/title="Player do Spotify: Pandora"/);
    // The player sits where the captures draw the player bar: right after the hero.
    expect(html.indexOf('id="player"')).toBeGreaterThan(html.indexOf('id="hero"'));
    expect(html.indexOf('id="player"')).toBeLessThan(html.indexOf('Últimos lançamentos'));
  });

  test('HOME-07 upcoming shows or the empty state reflect the configured agenda', () => {
    const upcoming = showTabs(shows, new Date()).proximos;
    const section = element(html, /<section\b[^>]*data-home-shows/);
    expect(section, 'shows section').not.toBe('');
    expect([...section.matchAll(/data-show-id="([^"]+)"/g)].map((m) => m[1])).toEqual(
      upcoming.map((show) => show.id),
    );
    const empty = element(section, /<div\b[^>]*data-shows-empty/);
    if (upcoming.length) {
      expect(empty).toMatch(/data-shows-empty[^>]*\bhidden\b/);
      return;
    }
    expect(empty).not.toMatch(/data-shows-empty[^>]*\bhidden\b/);
    expect(textOf(empty)).toContain('Nenhum show anunciado no momento');
    const hrefs = anchors(empty).map((a) => a.href);
    expect(hrefs).toContain(site.social.instagram);
    expect(hrefs).toContain(site.social.youtube);
  });

  test('HOME-09 shows all configured stats in JSON order, or omits the empty row', () => {
    if (stats.length) {
      const row = element(html, /<dl\b[^>]*data-stats/);
      expect([...row.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>/g)].map((m) => textOf(m[1]))).toEqual(
        stats.map((s) => s.rotulo),
      );
      expect([...row.matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => textOf(m[1]))).toEqual(
        stats.map((s) => s.valor),
      );
      return;
    }
    expect(html).not.toMatch(/data-stats/);
    const hero = element(html, /<section\b[^>]*id="hero"/);
    expect(hero).not.toMatch(/<dl\b/);
  });
});
