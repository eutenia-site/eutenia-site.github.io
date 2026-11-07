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
        anchors(inner).some((a) => a.href === '/eutenia-site/privacidade/'),
        `${route} consent links privacidade`,
      ).toBe(true);
    }
    // Every consent checkbox on every page has such a label.
    const boxes = distPages().flatMap(({ html }) => [
      ...html.matchAll(/<input\b[^>]*name="consentimento"[^>]*>/g),
    ]);
    expect(boxes).toHaveLength(labels.length);
  });
});
