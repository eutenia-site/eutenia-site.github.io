import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';
import pandora from '../../src/assets/capas/pandora.jpg';
import CoverTile from '../../src/components/ui/CoverTile.astro';
import ProductGrid from '../../src/components/ProductGrid.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('CoverTile', () => {
  test('DATA-05 release without cover renders the Eutenia mark tile', async () => {
    const html = await container.renderToString(CoverTile, { props: { titulo: 'Sem Arte' } });

    expect(html).not.toMatch(/<img\b/);
    const tile = /<div\b[^>]*data-cover-fallback[^>]*>([\s\S]*?)<\/div>/.exec(html);
    expect(tile, 'fallback tile').not.toBeNull();
    expect(tile![0]).toMatch(/role="img"/);
    expect(tile![0]).toMatch(/aria-label="Sem Arte \(sem capa\)"/);
    expect(tile![0]).toMatch(/bg-surface-container-highest/);
    expect(tile![1].replace(/<[^>]+>/g, '').trim()).toBe('Eutenia');

    // The same release with a cover shows the cover, not the mark.
    const withCover = await container.renderToString(CoverTile, {
      props: { titulo: 'Pandora', capa: pandora },
    });
    expect(withCover).toMatch(/<img\b[^>]*alt="Capa de Pandora"/);
    expect(withCover).not.toMatch(/data-cover-fallback/);
  });
});

describe('ProductGrid', () => {
  const instagram = 'https://www.instagram.com/euteniaoficial/';

  test('LOJA-06 empty product list renders Produtos em breve', async () => {
    const html = await container.renderToString(ProductGrid, {
      props: { products: [], instagram },
    });
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    expect(text).toContain('Produtos em breve');
    const link = /<a\b[^>]*href="([^"]+)"[^>]*>\s*Instagram\s*<\/a>/.exec(html);
    expect(link, 'Instagram link').not.toBeNull();
    expect(link![1]).toBe(instagram);
    expect(html).not.toMatch(/data-product-list|data-filter-bar/);

    // One product: the grid shows it and no empty message.
    const one = await container.renderToString(ProductGrid, {
      props: {
        instagram,
        products: [
          {
            id: 'x',
            nome: 'Camiseta X',
            categoria: 'camisetas',
            precoCentavos: 11990,
            imagem: 'placeholders/produtos/camiseta-pandora.jpg',
            adicionadoEm: new Date('2026-01-01'),
          },
        ],
      },
    });
    expect(one).toMatch(/data-product-list/);
    expect(one).toContain('Camiseta X');
    expect(one).not.toContain('Produtos em breve');
  });
});
