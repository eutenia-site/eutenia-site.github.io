/** AD-004: site pages, in menu order. */
export const PAGES = [
  { label: 'Início', path: '/', icon: 'home' },
  { label: 'Discografia', path: '/discografia/', icon: 'album' },
  { label: 'Shows', path: '/shows/', icon: 'confirmation_number' },
  { label: 'Loja', path: '/loja/', icon: 'shopping_bag' },
  { label: 'Fãs', path: '/fas/', icon: 'groups' },
  { label: 'Downloads', path: '/downloads/', icon: 'folder_open' },
  { label: 'Contato', path: '/contato/', icon: 'mail' },
] as const;

/** Social networks in site config order; BrandIcon renders each platform's mark. */
export const SOCIALS = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X' },
  { key: 'tiktok', label: 'TikTok' },
] as const;

/** True when `href` (a base-prefixed page URL) is the page at `pathname`. */
export function isCurrent(pathname: string, href: string): boolean {
  const slash = (p: string) => p.replace(/\/?$/, '/');
  return slash(pathname) === slash(href);
}

/** AD-004: mobile bottom bar items. */
export const BAR_ITEMS = [
  { label: 'Início', path: '/', icon: 'home' },
  { label: 'Música', path: '/discografia/', icon: 'album' },
  { label: 'Shows', path: '/shows/', icon: 'confirmation_number' },
  { label: 'Loja', path: '/loja/', icon: 'shopping_bag' },
  { label: 'Contato', path: '/contato/', icon: 'mail' },
] as const;
