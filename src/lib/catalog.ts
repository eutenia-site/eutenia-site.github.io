/** Release fields the catalog rules read. */
export interface ReleaseLike {
  tipo: 'album' | 'ep' | 'single' | 'ao-vivo';
  data: Date | string;
}

/** Product fields the store rules read. */
export interface ProductLike {
  categoria: ProductCategory;
  precoCentavos: number;
  adicionadoEm: Date | string;
}

export type ProductCategory =
  'camisetas' | 'moletons' | 'midia-fisica' | 'acessorios' | 'edicoes-limitadas';

/** Discografia filters (DISC-05); "ao-vivo" appears only when such releases exist (Q26). */
export type DiscKind = 'albuns' | 'singles' | 'ao-vivo' | 'videoclipes';
export type DiscFilter = 'todos' | DiscKind;
export type ProductFilter = 'todos' | ProductCategory;
export type ProductOrder = 'recentes' | 'menor-preco' | 'maior-preco';

const time = (value: Date | string) => new Date(value).getTime();

/** Filter bucket of a release: albums and EPs share "Álbuns & EPs". */
export function releaseKind(tipo: ReleaseLike['tipo']): DiscKind {
  if (tipo === 'single') return 'singles';
  if (tipo === 'ao-vivo') return 'ao-vivo';
  return 'albuns';
}

/** HOME-05: the n newest releases, newest first; equal dates keep input order. */
export function latestReleases<T extends Pick<ReleaseLike, 'data'>>(
  releases: readonly T[],
  n = 4,
): T[] {
  return [...releases].sort((a, b) => time(b.data) - time(a.data)).slice(0, n);
}

/** DISC-05: items of one kind; "todos" keeps every item. */
export function filterByKind<T extends { kind: DiscKind }>(
  items: readonly T[],
  kind: DiscFilter,
): T[] {
  return kind === 'todos' ? [...items] : items.filter((item) => item.kind === kind);
}

/** LOJA-02: products of one category; "todos" keeps every product. */
export function filterProducts<T extends Pick<ProductLike, 'categoria'>>(
  products: readonly T[],
  category: ProductFilter,
): T[] {
  return category === 'todos' ? [...products] : products.filter((p) => p.categoria === category);
}

/**
 * LOJA-03: "recentes" by adicionadoEm desc, "menor-preco" asc, "maior-preco" desc.
 * Equal prices fall back to newest first; full ties keep input order.
 */
export function sortProducts<T extends ProductLike>(
  products: readonly T[],
  order: ProductOrder,
): T[] {
  const newest = (a: T, b: T) => time(b.adicionadoEm) - time(a.adicionadoEm);
  const compare =
    order === 'menor-preco'
      ? (a: T, b: T) => a.precoCentavos - b.precoCentavos || newest(a, b)
      : order === 'maior-preco'
        ? (a: T, b: T) => b.precoCentavos - a.precoCentavos || newest(a, b)
        : newest;
  return [...products].sort(compare);
}

/** Q26: filters that would show at least one item, in their given order; "todos" always stays. */
export function visibleFilters<F extends string>(
  filters: readonly F[],
  itemKeys: readonly string[],
): F[] {
  const present = new Set(itemKeys);
  return filters.filter((f) => f === 'todos' || present.has(f));
}
