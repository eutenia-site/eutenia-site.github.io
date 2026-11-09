import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const distDir = fileURLToPath(new URL('../../dist/', import.meta.url));

/** Every generated HTML page in dist/, as { route, html } (route relative to dist/). */
export function distPages(): { route: string; html: string }[] {
  const out: { route: string; html: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.html'))
        out.push({
          route: relative(distDir, path).split('\\').join('/'),
          html: readFileSync(path, 'utf8'),
        });
    }
  };
  walk(distDir);
  return out.sort((a, b) => a.route.localeCompare(b.route));
}

export function readPage(route: string): string {
  return readFileSync(join(distDir, route), 'utf8');
}

/** Decodes the few entities Astro emits in text and attribute values. */
export function decode(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

/** Plain text of an HTML fragment, whitespace collapsed. */
export function textOf(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim();
}

/** Anchors in an HTML fragment as { href, text, attrs }. */
export function anchors(html: string): { href: string; text: string; attrs: string }[] {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(([, attrs, inner]) => ({
    href: decode(/\bhref="([^"]*)"/.exec(attrs)?.[1] ?? ''),
    text: textOf(inner),
    attrs,
  }));
}
