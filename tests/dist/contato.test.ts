import { describe, expect, test } from 'vitest';
import site from '../../src/config/site.json' with { type: 'json' };
import { anchors, readPage, textOf } from './html';

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
  test('CONT-02 contact highlights one direct e-mail beside the form', () => {
    expect(html).not.toMatch(/data-departamentos|data-department=|data-download-group/);
    const direct = block(html, 'data-contact-email');
    const links = anchors(direct);
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe(site.email);
    expect(links[0].href).toBe(`mailto:${site.email}`);
    expect(html).toMatch(/data-contact-form/);
  });

  test('CONT-03 form has fields with required marks', () => {
    const form = block(html, 'data-contact-form');
    const fields: [string, string, boolean][] = [
      ['nome', 'Seu nome / empresa', true],
      ['email', 'E-mail corporativo ou contato', true],
      ['telefone', 'Telefone / WhatsApp', false],
      ['departamento', 'Assunto', true],
      ['cidade', 'Cidade & estado (local do show)', false],
      ['data', 'Data prevista / estimada', false],
      ['mensagem', 'Mensagem Detalhada', true],
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
