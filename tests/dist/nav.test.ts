import { describe, expect, test } from 'vitest';
import site from '../../src/config/site.json' with { type: 'json' };
import { anchors, decode, distPages, textOf } from './html';

const BASE = '/';
const FOOTER_LINKS = [
  ['Início', BASE],
  ['Discografia', `${BASE}discografia/`],
  ['Shows', `${BASE}shows/`],
  ['Loja', `${BASE}loja/`],
  ['Downloads', `${BASE}downloads/`],
  ['Contato', `${BASE}contato/`],
  ['Política de Privacidade', `${BASE}privacidade/`],
];
const SOCIALS = [
  ['YouTube', site.social.youtube],
  ['Spotify', site.social.spotify],
  ['Instagram', site.social.instagram],
  ['Facebook', site.social.facebook],
  ['X', site.social.x],
  ['TikTok', site.social.tiktok],
];

describe('navigation (dist)', () => {
  test('NAV-01 every route has lang pt-BR, title and description', () => {
    const pages = distPages();
    expect(pages.map((p) => p.route)).toContain('index.html');

    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const { route, html } of pages) {
      expect(html, route).toMatch(/<html[^>]*\blang="pt-BR"/);

      const titleTags = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
      expect(titleTags, `${route}: one <title>`).toHaveLength(1);
      const title = decode(titleTags[0][1]).trim();
      expect(title, `${route}: title starts with the band`).toMatch(
        route === 'index.html' ? /^Eutenia$/ : /^Eutenia \| .+/,
      );

      const descTags = [...html.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/g)];
      expect(descTags, `${route}: one meta description`).toHaveLength(1);
      const description = decode(descTags[0][1]).trim();
      expect(description.length, `${route}: description has text`).toBeGreaterThanOrEqual(30);

      expect(titles.get(title), `${route}: title "${title}" is its own`).toBeUndefined();
      expect(descriptions.get(description), `${route}: description is its own`).toBeUndefined();
      titles.set(title, route);
      descriptions.set(description, route);
    }
  });

  test('NAV-07 footer has links, privacy, socials and copyright', () => {
    const year = new Date().getFullYear();
    for (const { route, html } of distPages()) {
      const footers = [...html.matchAll(/<footer\b[\s\S]*?<\/footer>/g)].map((m) => m[0]);
      expect(footers, `${route}: one footer`).toHaveLength(1);
      const footer = footers[0];
      const links = anchors(footer);

      // The Eutenia mark links home.
      expect(links[0], `${route}: mark links home`).toMatchObject({ href: BASE });
      expect(footer, `${route}: logo is named`).toMatch(/<img\b[^>]*\balt="Eutenia"/);

      // Page links in menu order, then the privacy policy.
      const nav = /<nav\b[\s\S]*?<\/nav>/.exec(footer)?.[0] ?? '';
      expect(
        anchors(nav).map((a) => [a.text, a.href]),
        `${route}: page links`,
      ).toEqual(FOOTER_LINKS);

      // The six socials from the site config, each named and opening in a new tab.
      const socials = links.filter((a) => /aria-label="Eutenia no /.test(a.attrs));
      expect(
        socials.map((a) => [/aria-label="Eutenia no ([^"]+)"/.exec(a.attrs)![1], a.href]),
        `${route}: socials`,
      ).toEqual(SOCIALS);
      for (const a of socials) expect(a.attrs, `${route}: ${a.href}`).toMatch(/target="_blank"/);

      // Copyright with the current year and the contact e-mail.
      expect(textOf(footer), `${route}: copyright`).toContain(
        `© ${year} Eutenia. Todos os direitos reservados.`,
      );
      expect(links, `${route}: e-mail`).toContainEqual(
        expect.objectContaining({
          href: 'mailto:contatoeutenia@gmail.com',
          text: 'contatoeutenia@gmail.com',
        }),
      );
    }
  });
});
