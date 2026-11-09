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
      expect(card).toContain(`src="/${product.imagens[0]}"`);
      for (const image of product.imagens) {
        expect(existsSync(join(distDir, image)), image).toBe(true);
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
