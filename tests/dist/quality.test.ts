import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { describe, expect, test } from 'vitest';
import { decode, distDir, distPages } from './html';

const BASE = '/';
const SITE = 'https://eutenia.com.br';

/** Every href, src and srcset URL in the page. */
function references(html: string): string[] {
  const out: string[] = [];
  for (const [, attr, value] of html.matchAll(/\s(href|src|srcset)="([^"]*)"/gi)) {
    const v = decode(value);
    if (attr.toLowerCase() === 'srcset')
      out.push(
        ...v
          .split(',')
          .map((c) => c.trim().split(/\s+/)[0])
          .filter(Boolean),
      );
    else out.push(v);
  }
  return out;
}

/** Site-origin or base-path URLs in `<meta content>` (og:image, og:url, twitter:image). */
function metaReferences(html: string): string[] {
  return [...html.matchAll(/<meta\b[^>]*\scontent="([^"]*)"/gi)]
    .map((m) => decode(m[1]))
    .filter((v) => v.startsWith(SITE + BASE) || v.startsWith(BASE));
}

/** Every `url(...)` reference in a stylesheet, minus inline data URIs. */
function cssReferences(css: string): string[] {
  return [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)]
    .map((m) => m[2].trim())
    .filter((v) => !v.startsWith('data:') && !v.startsWith('#'));
}

/** The dist/ file an internal reference resolves to, or null for an external one. */
function target(ref: string, pageRoute: string): string | null {
  let path = ref.split(/[?#]/)[0];
  if (path.startsWith(SITE + BASE)) path = path.slice(SITE.length);
  if (path === '' || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(path)) return null;
  if (!path.startsWith('/')) path = posix.join(BASE, posix.dirname(pageRoute), path);
  expect(path.startsWith(BASE), `${pageRoute}: ${ref} is outside the base path`).toBe(true);
  const rel = decodeURIComponent(path.slice(BASE.length));
  return rel === '' || rel.endsWith('/') ? `${rel}index.html` : rel;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('NAV-08', () => {
  test('NAV-08 no internal link resolves to 404', () => {
    const pages = distPages();
    expect(pages.length).toBeGreaterThanOrEqual(8);
    let checked = 0;
    const missing: string[] = [];
    for (const { route, html } of pages) {
      for (const ref of references(html)) {
        const file = target(ref, route);
        if (file == null) continue;
        checked++;
        if (!existsSync(join(distDir, file))) missing.push(`${route}: ${ref}`);
      }
    }
    // Navigation, footer, images and stylesheets on every page.
    expect(checked).toBeGreaterThan(pages.length * 15);

    // Social preview URLs (og:url on every page, og:image) point at files that exist.
    let metaChecked = 0;
    for (const { route, html } of pages) {
      for (const ref of metaReferences(html)) {
        const file = target(ref, route);
        if (file == null) continue;
        metaChecked++;
        if (!existsSync(join(distDir, file))) missing.push(`${route}: <meta> ${ref}`);
      }
    }
    expect(metaChecked).toBeGreaterThanOrEqual(pages.length);

    // url(...) in the built stylesheets (fonts, background images), relative to the CSS file.
    const sheets = walk(join(distDir, '_astro')).filter((f) => f.endsWith('.css'));
    expect(sheets.length).toBeGreaterThan(0);
    for (const sheet of sheets) {
      const route = sheet.slice(distDir.length).split('\\').join('/');
      for (const ref of cssReferences(readFileSync(sheet, 'utf8'))) {
        const file = target(ref, route);
        if (file == null) continue;
        if (!existsSync(join(distDir, file))) missing.push(`${route}: url(${ref})`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('DATA-04', () => {
  test('DATA-04 no image from temporary design hosts', () => {
    const files = walk(distDir).filter((f) => /\.(html|css|js|json|xml|txt|svg)$/.test(f));
    expect(files.some((f) => f.endsWith('index.html'))).toBe(true);
    const offending = files.filter((f) => /googleusercontent/i.test(readFileSync(f, 'utf8')));
    expect(offending.map((f) => f.slice(dirname(distDir).length))).toEqual([]);
  });
});

describe('icon font subset', () => {
  test('every Material Symbols icon on a page is in the subset font request', () => {
    const missing: string[] = [];
    let icons = 0;
    for (const { route, html } of distPages()) {
      const request = /family=Material\+Symbols\+Outlined[^"]*icon_names=([a-z_,]+)/.exec(html);
      expect(request, `${route} requests the icon font subset`).not.toBeNull();
      const subset = new Set(request![1].split(','));
      for (const [, name] of html.matchAll(
        /class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z_]+)\s*</g,
      )) {
        icons++;
        if (!subset.has(name)) missing.push(`${route}: ${name}`);
      }
    }
    expect(icons).toBeGreaterThan(50);
    expect(missing).toEqual([]);
  });
});
