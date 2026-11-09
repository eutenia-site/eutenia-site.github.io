import { describe, expect, test } from 'vitest';
import files from '../../src/content/data/press.json' with { type: 'json' };
import { anchors, readPage, textOf } from './html';

const html = readPage('downloads/index.html');

describe('Materiais para contratantes', () => {
  test('the dedicated page groups individual files and only offers available downloads', () => {
    expect(textOf(html)).toContain('Materiais para contratantes');
    for (const category of ['apresentacao', 'tecnico', 'divulgacao']) {
      const group = new RegExp(
        `<section[^>]*data-download-group="${category}"[\\s\\S]*?<\\/section>`,
      ).exec(html)![0];
      const expected = files.filter((file) => file.categoria === category);
      expect([...group.matchAll(/data-press-file/g)].length).toBe(expected.length);
      expect(
        anchors(group)
          .filter((link) => /\bdownload\b/.test(link.attrs))
          .map((link) => link.href)
          .sort(),
      ).toEqual(
        expected
          .filter((file) => file.disponivel)
          .map((file) => `/${file.arquivo}`)
          .sort(),
      );
      if (expected.some((file) => !file.disponivel)) expect(textOf(group)).toContain('Em breve');
    }
    expect(html).not.toContain('data-download-bundle');
    expect(html).not.toMatch(/href="\/placeholders\/downloads\//);
  });
});
