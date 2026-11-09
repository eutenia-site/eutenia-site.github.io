import { describe, expect, test } from 'vitest';
import press from '../../src/content/data/press.json' with { type: 'json' };
import products from '../../src/content/data/products.json' with { type: 'json' };
import site from '../../src/config/site.json' with { type: 'json' };
import { anchors, decode, readPage, textOf } from './html';

const html = readPage('contato/index.html');

/** The HTML of the first element carrying `attr`, up to its matching closing tag. */
function block(source: string, attr: string): string {
  const start = source.search(new RegExp(`<(\\w+)[^>]*\\b${attr}(?![\\w-])`));
  expect(start, `element with ${attr}`).toBeGreaterThanOrEqual(0);
  const tag = /^<(\w+)/.exec(source.slice(start))![1];
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return source.slice(start, re.lastIndex);
  }
  throw new Error(`unclosed ${tag}`);
}

describe('Contato (dist, real content)', () => {
  test('CONT-02 department cards mailto contato with department subject', () => {
    const section = block(html, 'data-departamentos');
    const raw = [...section.matchAll(/data-department="([^"]+)"/g)].map((m) => m[1]);
    const cards = raw.map(decode);
    expect(cards).toEqual([
      'Booking & Shows',
      'Imprensa & Mídia',
      'Merch & Loja',
      'Eutenia Army & Parcerias',
    ]);
    for (const [i, dept] of cards.entries()) {
      const card = block(section, `data-department="${raw[i]}"`);
      expect(textOf(card)).toContain(dept);
      const shown = anchors(card).find((a) => a.text === 'contatoeutenia@gmail.com');
      expect(shown, `${dept} shows the address`).toBeDefined();
      expect(shown!.href).toBe(
        `mailto:contatoeutenia@gmail.com?subject=${encodeURIComponent(dept)}`,
      );
      // Every mailto on the card goes to the one address (AD-007).
      for (const a of anchors(card))
        expect(a.href.split('?')[0]).toBe('mailto:contatoeutenia@gmail.com');
    }
    // AD-007: no department-specific address and no phone number.
    const text = textOf(html);
    expect(text).not.toMatch(/booking@|imprensa@|loja@/);
    expect(text).not.toMatch(/\+55|98765-4321/);
  });

  test('CONT-02 merch card claims no online store or orders', () => {
    // The store sells nothing yet: no store URL and no product with a purchase link.
    expect(site.lojaUrl).toBe('');
    expect(products.some((p) => 'url' in p && p.url)).toBe(false);
    const section = block(html, 'data-departamentos');
    const card = textOf(block(section, 'data-department="Merch &amp; Loja"'));
    expect(card).toContain('Merch & Loja');
    expect(card).not.toMatch(/pedido|rastreamento|pós-venda|loja online|e-commerce|envios/i);
  });

  test('CONT-03 form has fields with required marks', () => {
    const form = block(html, 'data-contact-form');
    const fields: [string, string, boolean][] = [
      ['nome', 'Seu nome / empresa', true],
      ['email', 'E-mail corporativo ou contato', true],
      ['telefone', 'Telefone / WhatsApp', false],
      ['departamento', 'Departamento / finalidade', true],
      ['cidade', 'Cidade & estado (local do show)', false],
      ['data', 'Data prevista / estimada', false],
      ['mensagem', 'Proposta ou mensagem detalhada', true],
      ['consentimento', 'Concordo com o envio dos dados', true],
    ];
    const names = [...form.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(names).toEqual(fields.map(([n]) => n));
    for (const [name, label, required] of fields) {
      const control = new RegExp(`<(?:input|select|textarea)\\b[^>]*\\bname="${name}"[^>]*>`).exec(
        form,
      )![0];
      const id = /\bid="([^"]+)"/.exec(control)![1];
      const labelHtml = new RegExp(`<label[^>]*for="${id}"[^>]*>([\\s\\S]*?)</label>`).exec(
        form,
      )![1];
      expect(textOf(labelHtml)).toContain(label);
      expect(/\brequired\b/.test(control), `${name} required`).toBe(required);
      expect(textOf(labelHtml).endsWith('*'), `${name} marked *`).toBe(required);
    }
    expect(form).toMatch(/type="email"[^>]*name="email"|name="email"[^>]*type="email"/);
    // No file upload in v0 (Assumptions).
    expect(form).not.toMatch(/type="file"/);
  });

  test('CONT-08 press kit lists files with type and size', () => {
    expect(press.length).toBeGreaterThan(0);
    const section = block(html, 'data-press');
    expect(textOf(section)).toMatch(/Press kit & riders oficiais/i);
    const items = [...section.matchAll(/<li\b[^>]*data-press-file[\s\S]*?<\/li>/g)].map(
      (m) => m[0],
    );
    expect(items).toHaveLength(press.length);
    for (const file of press) {
      const item = items.find((it) => textOf(it).includes(file.titulo));
      expect(item, `${file.id} listed`).toBeDefined();
      const text = textOf(item!);
      expect(text).toContain(file.titulo);
      expect(text).toContain(`${file.tipo} • ${file.tamanho}`);
      const link = anchors(item!).find((a) => /\bdownload\b/.test(a.attrs));
      expect(link, `${file.id} download link`).toBeDefined();
      expect(link!.href).toBe(`/${file.arquivo}`);
    }
  });

  test('CONT-09 redes section links six profiles in the configured order', () => {
    const section = block(html, 'data-redes');
    expect(textOf(section)).toMatch(/Redes oficiais & streaming/i);
    const links = anchors(section);
    expect(links.map((a) => a.href)).toEqual([
      site.social.youtube,
      site.social.spotify,
      site.social.instagram,
      site.social.facebook,
      site.social.x,
      site.social.tiktok,
    ]);
    for (const a of links) expect(a.attrs).toMatch(/target="_blank"/);
  });
});
