import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import products from '../../src/content/data/products.json' with { type: 'json' };
import { formatPrice } from '../../src/lib/format';
import { decode, distDir, readPage, textOf } from './html';

const html = readPage('loja/index.html');
const cards = [
  ...html.matchAll(
    /<li\b[^>]*\bdata-product\b[\s\S]*?data-product-action[\s\S]*?<\/(?:a|button)>/g,
  ),
].map((m) => m[0]);

describe('Loja (dist, real content)', () => {
  test('LOJA-05 cards show the configured products, prices and real photos', () => {
    expect(cards).toHaveLength(products.length);
    for (const product of products) {
      const card = cards.find((c) => decode(c).includes(`title="${product.nome}"`));
      expect(card, product.nome).toBeDefined();
      expect(textOf(card!)).toContain(product.nome);
      expect(textOf(card!)).toContain(formatPrice(product.precoCentavos));
      const gallery = JSON.parse(
        decode(/data-gallery-images="([^"]+)"/.exec(card!)![1]),
      ) as string[];
      expect(gallery).toHaveLength(product.imagens.length);
      expect(card).toContain(`src="${gallery[0]}"`);
      for (const [index, image] of gallery.entries()) {
        expect(image).toMatch(/^\/_astro\/.+\.webp$/);
        expect(existsSync(join(distDir, image.slice(1))), image).toBe(true);
        expect(existsSync(join('src/assets', product.imagens[index]))).toBe(true);
        expect(existsSync(join(distDir, product.imagens[index]))).toBe(false);
      }
      expect(card).toMatch(/data-gallery-prev/);
      expect(card).toMatch(/data-gallery-next/);
      expect(card).toMatch(/data-gallery-counter/);
      expect(card).toMatch(/data-product-action/);
    }
    expect(textOf(html)).not.toMatch(
      /carrinho|frete grátis|sem juros|pagamento criptografado|PIX/i,
    );
  });
});
