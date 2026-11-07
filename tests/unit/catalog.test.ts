import { describe, expect, test } from 'vitest';
import {
  filterByKind,
  filterProducts,
  latestReleases,
  releaseKind,
  sortProducts,
  visibleFilters,
  type DiscKind,
  type ProductLike,
  type ReleaseLike,
} from '../../src/lib/catalog';

type Release = ReleaseLike & { id: string };
const rel = (id: string, data: string, tipo: Release['tipo'] = 'single'): Release => ({
  id,
  data,
  tipo,
});
type Product = ProductLike & { id: string };
const prod = (
  id: string,
  precoCentavos: number,
  adicionadoEm: string,
  categoria: Product['categoria'] = 'camisetas',
): Product => ({ id, precoCentavos, adicionadoEm, categoria });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe('latestReleases (HOME-05)', () => {
  test('HOME-05 latest releases returns 4 newest first', () => {
    const releases = [
      rel('2019', '2019-05-01'),
      rel('2024', '2024-03-15', 'album'),
      rel('2021', '2021-07-09'),
      rel('2025', '2025-10-17', 'album'),
      rel('2017', '2017-01-20', 'ep'),
      rel('2023', '2023-11-30'),
      rel('2022', '2022-02-02'),
    ];
    expect(ids(latestReleases(releases, 4))).toEqual(['2025', '2024', '2023', '2022']);
    expect(ids(latestReleases(releases))).toEqual(['2025', '2024', '2023', '2022']);
  });

  test('accepts Date values and returns fewer when the list is short', () => {
    const releases = [
      { id: 'a', data: new Date('2020-01-01') },
      { id: 'b', data: new Date('2022-01-01') },
    ];
    expect(ids(latestReleases(releases, 4))).toEqual(['b', 'a']);
  });

  test('empty input returns empty; equal dates keep input order; input untouched', () => {
    expect(latestReleases([], 4)).toEqual([]);
    const tied = [rel('x', '2024-01-01'), rel('y', '2024-01-01'), rel('z', '2023-01-01')];
    expect(ids(latestReleases(tied, 2))).toEqual(['x', 'y']);
    expect(ids(tied)).toEqual(['x', 'y', 'z']);
  });
});

describe('filterByKind (DISC-05)', () => {
  const items: { id: string; kind: DiscKind }[] = [
    { id: 'pandora', kind: releaseKind('album') },
    { id: 'ep', kind: releaseKind('ep') },
    { id: 'single', kind: releaseKind('single') },
    { id: 'live', kind: releaseKind('ao-vivo') },
    { id: 'clipe', kind: 'videoclipes' },
  ];

  test('DISC-05 filter keeps only items of the chosen kind', () => {
    expect(ids(filterByKind(items, 'singles'))).toEqual(['single']);
    expect(ids(filterByKind(items, 'albuns'))).toEqual(['pandora', 'ep']);
    expect(ids(filterByKind(items, 'videoclipes'))).toEqual(['clipe']);
    expect(ids(filterByKind(items, 'ao-vivo'))).toEqual(['live']);
  });

  test('todos keeps every item; empty input stays empty', () => {
    expect(ids(filterByKind(items, 'todos'))).toEqual(ids(items));
    expect(filterByKind([], 'singles')).toEqual([]);
  });

  test('albums and EPs share the Álbuns & EPs bucket', () => {
    expect(releaseKind('album')).toBe('albuns');
    expect(releaseKind('ep')).toBe('albuns');
    expect(releaseKind('single')).toBe('singles');
    expect(releaseKind('ao-vivo')).toBe('ao-vivo');
  });
});

describe('filterProducts (LOJA-02)', () => {
  const products = [
    prod('cam', 11990, '2026-01-01', 'camisetas'),
    prod('mol', 24990, '2026-02-01', 'moletons'),
    prod('cd', 4990, '2026-03-01', 'midia-fisica'),
    prod('mol2', 25990, '2026-04-01', 'moletons'),
  ];

  test('LOJA-02 category filter keeps only that category', () => {
    expect(ids(filterProducts(products, 'moletons'))).toEqual(['mol', 'mol2']);
    expect(ids(filterProducts(products, 'acessorios'))).toEqual([]);
  });

  test('todos keeps every product; empty input stays empty', () => {
    expect(ids(filterProducts(products, 'todos'))).toEqual(['cam', 'mol', 'cd', 'mol2']);
    expect(filterProducts([], 'moletons')).toEqual([]);
  });
});

describe('sortProducts (LOJA-03)', () => {
  const products = [
    prod('mid', 11990, '2026-03-01'),
    prod('cheap', 4990, '2026-01-01'),
    prod('expensive', 25990, '2026-02-01'),
    prod('newest', 8990, '2026-05-01'),
  ];

  test('LOJA-03 sorts by price asc, desc and newest', () => {
    expect(ids(sortProducts(products, 'menor-preco'))).toEqual([
      'cheap',
      'newest',
      'mid',
      'expensive',
    ]);
    expect(ids(sortProducts(products, 'maior-preco'))).toEqual([
      'expensive',
      'mid',
      'newest',
      'cheap',
    ]);
    expect(ids(sortProducts(products, 'recentes'))).toEqual([
      'newest',
      'mid',
      'expensive',
      'cheap',
    ]);
  });

  test('equal prices fall back to newest first', () => {
    const tied = [prod('old', 9990, '2025-01-01'), prod('new', 9990, '2026-01-01')];
    expect(ids(sortProducts(tied, 'menor-preco'))).toEqual(['new', 'old']);
    expect(ids(sortProducts(tied, 'maior-preco'))).toEqual(['new', 'old']);
  });

  test('accepts Date values; empty input stays empty; input untouched', () => {
    const dated = [
      { ...prod('a', 100, '2025-01-01'), adicionadoEm: new Date('2025-01-01') },
      { ...prod('b', 100, '2025-01-01'), adicionadoEm: new Date('2025-06-01') },
    ];
    expect(ids(sortProducts(dated, 'recentes'))).toEqual(['b', 'a']);
    expect(ids(dated)).toEqual(['a', 'b']);
    expect(sortProducts([], 'recentes')).toEqual([]);
  });
});

describe('visibleFilters (Q26)', () => {
  test('hides filters with zero items and keeps todos and the given order', () => {
    const filters = ['todos', 'albuns', 'singles', 'ao-vivo', 'videoclipes'] as const;
    expect(visibleFilters(filters, ['singles', 'albuns', 'videoclipes', 'singles'])).toEqual([
      'todos',
      'albuns',
      'singles',
      'videoclipes',
    ]);
  });

  test('with no items only todos remains', () => {
    expect(visibleFilters(['todos', 'camisetas', 'moletons'], [])).toEqual(['todos']);
  });
});
