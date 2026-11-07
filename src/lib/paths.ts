const EXTERNAL = /^([a-z][a-z\d+.-]*:|\/\/|#)/i;

/**
 * NAV-08: internal URL under the site base. Joins slashes once, ends page paths with "/"
 * (trailingSlash: 'always'), leaves file paths ("x.jpg") without one, and returns external
 * (http:, https:, mailto:, //host) and "#anchor" URLs untouched.
 */
export function url(path: string, base: string = import.meta.env.BASE_URL): string {
  if (EXTERNAL.test(path)) return path;
  const root = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  const cut = path.search(/[?#]/);
  const pathname = cut === -1 ? path : path.slice(0, cut);
  const suffix = cut === -1 ? '' : path.slice(cut);
  const clean = pathname.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  const last = clean.split('/').pop() ?? '';
  const page = clean === '' || clean.endsWith('/') || last.includes('.') ? clean : `${clean}/`;
  return `${root}${page}${suffix}`;
}
