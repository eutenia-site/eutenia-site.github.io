import { describe, expect, test } from 'vitest';
import { decode, distPages } from './html';

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
      expect(title, `${route}: title names the band`).toMatch(/Eutenia/);

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
});
