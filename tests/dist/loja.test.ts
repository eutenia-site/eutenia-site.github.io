import { describe, expect, test } from 'vitest';
import products from '../../src/content/data/products.json' with { type: 'json' };
import { readPage, textOf } from './html';

const html = readPage('loja/index.html');
const cards = [
  ...html.matchAll(
    /<li\b[^>]*\bdata-product\b[\s\S]*?data-product-action[\s\S]*?<\/(?:a|button)>/g,
  ),
].map((m) => m[0]);
const cardOf = (nome: string) => {
  const card = cards.find((c) => c.includes(`title="${nome.replace(/"/g, '&quot;')}"`));
  expect(card, `card for ${nome}`).toBeDefined();
  return card!;
};

describe('Loja (dist, real content)', () => {
  test('LOJA-05 card shows category, name, price, badge and sizes as text', () => {
    expect(cards).toHaveLength(products.length);

    const camiseta = cardOf('Camiseta Pandora');
    const text = textOf(camiseta);
    expect(text).toContain('Camisetas & Vestuário');
    expect(text).toContain('Camiseta Pandora');
    expect(text).toContain('R$ 119,90');
    expect(textOf(/data-product-badge[^>]*>([\s\S]*?)<\/span>/.exec(camiseta)![1])).toBe('Novo');
    const sizes = /<ul\b[^>]*data-product-sizes[^>]*>([\s\S]*?)<\/ul>/.exec(camiseta)![1];
    expect([...sizes.matchAll(/<li\b[^>]*>([^<]*)<\/li>/g)].map((m) => m[1].trim())).toEqual([
      'P',
      'M',
      'G',
      'GG',
      'XG',
    ]);
    // Sizes are text: no control inside the size list, and the only control is the action.
    expect(sizes).not.toMatch(/<(button|input|select|a)\b/);
    expect(camiseta.match(/<(button|input|select)\b/g) ?? []).toHaveLength(1);

    const moletom = textOf(cardOf('Moletom Canguru Eutenia Logo'));
    expect(moletom).toContain('Moletons');
    expect(moletom).toContain('R$ 249,90');

    const vinil = cardOf('Vinil 12" Pandora');
    expect(textOf(vinil)).toContain('Mídia física (CD & Vinil)');
    expect(textOf(vinil)).toContain('R$ 189,90');
    expect(textOf(/data-product-spec[^>]*>([\s\S]*?)<\/p>/.exec(vinil)![1])).toBe('Vinil 12"');
    expect(vinil).not.toMatch(/data-product-badge/);

    const poster = cardOf('Pôster Pandora (A2)');
    expect(textOf(poster)).toContain('R$ 49,90');
    expect(textOf(/data-product-badge[^>]*>([\s\S]*?)<\/span>/.exec(poster)![1])).toBe(
      'Edição limitada',
    );

    // AD-005: no cart, shipping strip or payment badges.
    const page = textOf(html);
    expect(page).not.toMatch(/carrinho|frete grátis|sem juros|pagamento criptografado|PIX/i);
  });
});
