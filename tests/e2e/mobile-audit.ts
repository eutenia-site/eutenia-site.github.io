import type { Page } from './base';

/** The 7 pages and the 404 that mobile-v1 audits below 768px (spec MOB-01..MOB-03). */
export const AUDIT_PAGES = [
  './',
  'discografia/',
  'shows/',
  'loja/',
  'fas/',
  'downloads/',
  'contato/',
  'privacidade/',
  'nao-existe/',
];

/** Opens each audited page and collects what `audit` reports there, prefixed by the route. */
export async function auditPages(
  page: Page,
  audit: (page: Page) => Promise<string[]>,
): Promise<string[]> {
  const found: string[] = [];
  for (const route of AUDIT_PAGES) {
    await page.goto(route);
    for (const hit of await audit(page)) found.push(`${route}: ${hit}`);
  }
  return found;
}
