import { describe, expect, test } from 'vitest';
import { anchors, distPages, readPage, textOf } from './html';

describe('Privacidade (dist, real content)', () => {
  test('PRIV-01 privacy page states data, purpose, contact and date', () => {
    const html = readPage('privacidade/index.html');
    const body = /<article\b[^>]*data-privacy[^>]*>([\s\S]*?)<\/article>/.exec(html);
    expect(body, 'rendered Markdown body').not.toBeNull();
    const text = textOf(html);

    expect(text).toContain('Política de Privacidade');
    expect(text).toContain('Última atualização: 7 de novembro de 2026');

    // Collected data, from the Markdown list.
    const items = [...body![1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => textOf(m[1]));
    for (const dado of ['nome', 'e-mail', 'telefone', 'cidade', 'mensagem']) {
      expect(
        items.some((i) => i.toLowerCase().includes(dado)),
        `lists ${dado}`,
      ).toBe(true);
    }
    // Purpose, no data sale, contact.
    expect(text).toMatch(/Finalidade/);
    expect(text).toMatch(/responder contatos e propostas/);
    expect(text).toMatch(/Não vendemos/);
    expect(anchors(body![1]).some((a) => a.href === 'mailto:contato@eutenia.com.br')).toBe(true);
    expect(text).toContain('contato@eutenia.com.br');
    // The review note is an HTML comment, not visible text.
    expect(html).toMatch(/<!--[^>]*revisão jurídica[^>]*-->/);
    expect(text).not.toMatch(/revisão jurídica/);
  });

  test('PRIV-02 consent labels link to privacidade', () => {
    const labels = distPages().flatMap(({ route, html }) =>
      [...html.matchAll(/<label\b[^>]*data-consent[^>]*>([\s\S]*?)<\/label>/g)].map((m) => ({
        route,
        inner: m[1],
      })),
    );
    // Contato and Shows each carry a form with consent.
    expect(new Set(labels.map((l) => l.route))).toEqual(
      new Set(['contato/index.html', 'shows/index.html']),
    );
    for (const { route, inner } of labels) {
      expect(
        anchors(inner).some((a) => a.href === '/privacidade/'),
        `${route} consent links privacidade`,
      ).toBe(true);
    }
    // Every consent checkbox on every page has such a label.
    const boxes = distPages().flatMap(({ html }) => [
      ...html.matchAll(/<input\b[^>]*name="consentimento"[^>]*>/g),
    ]);
    expect(boxes).toHaveLength(labels.length);
  });

  test('PRIV-01 third-party statement matches what the pages load', () => {
    const text = textOf(readPage('privacidade/index.html'));
    const pages = distPages().filter(({ route }) => route !== 'privacidade/index.html');
    const NAMES: Record<string, string> = {
      'index.html': 'Início',
      'discografia/index.html': 'Discografia',
    };

    // Spotify iframes with a src load with the page: the text must say so, page by page.
    const spotifyPages = pages
      .filter(({ html }) => /<iframe\b[^>]*\bsrc="https:\/\/open\.spotify\.com\//.test(html))
      .map(({ route }) => route);
    expect(spotifyPages).toContain('index.html');
    const spotify = /[^.;]*players? do Spotify[^.;]*/.exec(text)?.[0] ?? '';
    expect(spotify).toMatch(/carrega(m)? junto com a página/);
    for (const route of spotifyPages) {
      expect(NAMES[route], `${route} named in the statement`).toBeDefined();
      expect(spotify).toContain(NAMES[route]);
    }
    expect(text).not.toMatch(/Spotify[^.;]*só carrega/);

    // No page ships a YouTube iframe: videos load only on click; thumbnails come from YouTube.
    expect(pages.some(({ html }) => /<iframe\b[^>]*youtube/.test(html))).toBe(false);
    expect(text).toMatch(/vídeos do YouTube só carregam quando você clica/);
    if (pages.some(({ html }) => html.includes('https://i.ytimg.com/'))) {
      expect(text).toMatch(/imagem de capa do vídeo, servida pelo YouTube/);
    }

    // Fonts from Google Fonts.
    expect(pages.every(({ html }) => html.includes('https://fonts.googleapis.com/'))).toBe(true);
    expect(text).toContain('Google Fonts');
  });
});
