import { describe, expect, test } from 'vitest';
import fanKit from '../../src/content/data/fan-kit.json' with { type: 'json' };
import mural from '../../src/content/data/mural.json' with { type: 'json' };
import stats from '../../src/content/data/stats.json' with { type: 'json' };
import wallpapers from '../../src/content/data/wallpapers.json' with { type: 'json' };
import site from '../../src/config/site.json' with { type: 'json' };
import { anchors, readPage, textOf } from './html';

const html = readPage('fas/index.html');

describe('Fãs (dist, real content)', () => {
  test('FAS-03 wallpaper card has download link and metadata', () => {
    const cards = [...html.matchAll(/<li\b[^>]*\bdata-wallpaper\b[\s\S]*?<\/li>/g)].map(
      (m) => m[0],
    );
    expect(cards).toHaveLength(wallpapers.length);
    for (const w of wallpapers) {
      const card = cards.find((c) => c.includes(`/${w.arquivo}"`) && textOf(c).includes(w.titulo));
      expect(card, `card for ${w.id}`).toBeDefined();
      const text = textOf(card!);
      expect(textOf(/data-wallpaper-format[^>]*>([\s\S]*?)<\/span>/.exec(card!)![1])).toBe(
        w.formato,
      );
      expect(textOf(/data-wallpaper-resolution[^>]*>([\s\S]*?)<\/span>/.exec(card!)![1])).toBe(
        w.resolucao,
      );
      expect(text).toContain(w.titulo);
      expect(text).toContain(w.descricao);
      expect(text).toContain(`${w.tipo} • ${w.tamanho}`);
      const link = anchors(card!).find((a) => /\bdownload\b/.test(a.attrs));
      expect(link, `${w.id} download link`).toBeDefined();
      expect(link!.href).toBe(`/${w.arquivo}`);
    }
  });

  test('FAS-04 mural and telegram sections omitted when empty', () => {
    expect(mural).toHaveLength(0);
    expect(site.telegramUrl).toBe('');
    expect(stats).toHaveLength(0);
    const text = textOf(html);
    expect(html).not.toMatch(/data-mural|data-telegram|data-fas-stats/);
    expect(text).not.toMatch(/Mural dos fãs/i);
    expect(text).not.toMatch(/Telegram/i);
    expect(text).not.toMatch(/Entrar no exército VIP/i);
    expect(html).not.toMatch(/href="#mural"/);
    // The kit has data, so it shows, with one download per file.
    expect(fanKit.length).toBeGreaterThan(0);
    expect(html).toMatch(/data-fan-kit/);
    expect(text).toMatch(/Kit do fã & assets digitais/i);
    for (const k of fanKit) {
      expect(
        anchors(html).some((a) => a.href === `/${k.arquivo}` && /\bdownload\b/.test(a.attrs)),
      ).toBe(true);
    }
  });
});
