import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { describe, expect, test } from 'vitest';
import {
  collectionFiles,
  collections,
  contentRoot,
  productSchema,
  releaseSchema,
  showSchema,
  siteSchema,
  videoSchema,
  wallpaperSchema,
} from '../../src/content.config';

// image() only resolves inside an Astro build; a string stands in for it here.
const fakeImage = (() => z.string()) as unknown as SchemaContext['image'];
const release = releaseSchema({ image: fakeImage });

const validShow = {
  id: 'sp-2099',
  data: '2099-05-15',
  cidade: 'São Paulo',
  uf: 'SP',
  local: 'Carioca Club',
  endereco: 'Rua Cardeal Arcoverde, 2899',
  tipo: 'show',
  status: 'disponivel',
  ingressoUrl: 'https://example.com/ingresso',
};

const validRelease = {
  id: 'pandora',
  titulo: 'Pandora',
  tipo: 'album',
  data: '2024-03-03',
  faixas: [{ titulo: 'Indestrutível', duracaoSeg: 244 }],
  links: { spotify: 'https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM' },
};

const validProduct = {
  id: 'camiseta-pandora',
  nome: 'Camiseta Pandora',
  categoria: 'camisetas',
  precoCentavos: 11990,
  imagem: 'placeholders/camiseta.jpg',
  adicionadoEm: '2026-01-10',
};

const validSite = {
  email: 'contatoeutenia@gmail.com',
  formEndpoint: '',
  newsletterEndpoint: '',
  votoCidadeEndpoint: '',
  lojaUrl: '',
  telegramUrl: '',
  social: {
    spotify: 'https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM',
    instagram: 'https://www.instagram.com/euteniaoficial/',
    youtube: 'https://www.youtube.com/Eutenia',
    facebook: 'https://www.facebook.com/eutenia',
    x: 'https://twitter.com/EuteniaOficial',
    tiktok: 'https://www.tiktok.com/@euteniaoficial',
  },
};

function issuePaths(result: { success: boolean; error?: z.ZodError }) {
  expect(result.success).toBe(false);
  return result.error!.issues.map((i) => i.path.join('.'));
}

describe('DATA-01', () => {
  test('DATA-01 every collection uses a file loader under the content root', () => {
    const names = Object.keys(collections);
    expect(names.sort()).toEqual(
      [
        'fanKit',
        'mural',
        'press',
        'photos',
        'products',
        'releases',
        'shows',
        'site',
        'stats',
        'videos',
        'vip',
        'wallpapers',
      ].sort(),
    );
    expect(contentRoot).toBe('src/content/data');
    for (const name of names) {
      const loader = (collections as Record<string, { loader: { name: string } }>)[name].loader;
      expect(loader.name, name).toBe('file-loader');
      const file = collectionFiles[name];
      const root = name === 'site' ? 'src/config' : contentRoot;
      expect(relative(resolve(root), resolve(file)).startsWith('..'), `${name}: ${file}`).toBe(
        false,
      );
    }
  });
});

describe('required fields and refines', () => {
  test('valid entries parse', () => {
    expect(showSchema.safeParse(validShow).success).toBe(true);
    expect(release.safeParse(validRelease).success).toBe(true);
    expect(productSchema.safeParse(validProduct).success).toBe(true);
    expect(siteSchema.safeParse(validSite).success).toBe(true);
  });

  test('DATA-06 available show without ticket url fails schema', () => {
    for (const status of ['disponivel', 'ultimos']) {
      const { ingressoUrl: _omit, ...show } = { ...validShow, status };
      const result = showSchema.safeParse(show);
      expect(issuePaths(result)).toEqual(['ingressoUrl']);
      expect(result.error!.issues[0].message).toContain('sp-2099');
    }
    const { ingressoUrl: _omit, ...soldOut } = { ...validShow, status: 'esgotado' };
    expect(showSchema.safeParse(soldOut).success).toBe(true);
    expect(showSchema.safeParse({ ...soldOut, status: 'em-breve' }).success).toBe(true);
  });

  test('show rejects unknown status, invalid date and missing city', () => {
    expect(issuePaths(showSchema.safeParse({ ...validShow, status: 'cancelado' }))).toContain(
      'status',
    );
    expect(issuePaths(showSchema.safeParse({ ...validShow, data: '2099-13-45' }))).toContain(
      'data',
    );
    const { cidade: _c, ...noCity } = validShow;
    expect(issuePaths(showSchema.safeParse(noCity))).toContain('cidade');
  });

  test('show accepts closed historical entries without address or ticket link', () => {
    expect(
      showSchema.safeParse({
        ...validShow,
        data: '2014-05-30',
        status: 'encerrado',
        endereco: '',
        ingressoUrl: '',
      }).success,
    ).toBe(true);
    expect(issuePaths(showSchema.safeParse({ ...validShow, endereco: '' }))).toContain('endereco');
    expect(issuePaths(showSchema.safeParse({ ...validShow, ingressoUrl: '' }))).toContain(
      'ingressoUrl',
    );
  });

  test('SHOW-03 show date accepts only AAAA-MM-DD, not a date with time', () => {
    for (const data of ['2099-03-10T21:00:00-03:00', '2099-03-10T00:00:00Z', '2099-03-10 21:00']) {
      const result = showSchema.safeParse({ ...validShow, data });
      expect(issuePaths(result), data).toEqual(['data']);
      expect(result.error!.issues[0].message).toContain('"data"');
      expect(result.error!.issues[0].message).toContain('AAAA-MM-DD');
    }
    const parsed = showSchema.parse({ ...validShow, data: '2099-03-10' });
    expect(parsed.data).toEqual(new Date('2099-03-10T00:00:00Z'));
  });

  test('release requires title, known type, valid date and tracks with durations', () => {
    const { titulo: _t, ...noTitle } = validRelease;
    expect(issuePaths(release.safeParse(noTitle))).toContain('titulo');
    expect(issuePaths(release.safeParse({ ...validRelease, tipo: 'mixtape' }))).toContain('tipo');
    expect(issuePaths(release.safeParse({ ...validRelease, data: 'ontem' }))).toContain('data');
    expect(issuePaths(release.safeParse({ ...validRelease, faixas: [{ titulo: 'X' }] }))).toContain(
      'faixas.0.duracaoSeg',
    );
    expect(
      issuePaths(release.safeParse({ ...validRelease, links: { spotify: 'não é url' } })),
    ).toContain('links.spotify');
  });

  test('video requires title, date and oficial flag', () => {
    expect(issuePaths(videoSchema.safeParse({ id: 'Atv4aKAXEmg', data: '2024-01-31' }))).toEqual(
      expect.arrayContaining(['titulo', 'oficial']),
    );
  });

  test('product requires a known category, integer price and date added', () => {
    expect(productSchema.safeParse({ ...validProduct, url: '' }).success).toBe(true);
    expect(
      productSchema.safeParse({ ...validProduct, url: 'https://example.com/checkout' }).success,
    ).toBe(true);
    expect(issuePaths(productSchema.safeParse({ ...validProduct, url: 'checkout' }))).toContain(
      'url',
    );
    expect(issuePaths(productSchema.safeParse({ ...validProduct, categoria: 'tenis' }))).toContain(
      'categoria',
    );
    expect(
      issuePaths(productSchema.safeParse({ ...validProduct, precoCentavos: 119.9 })),
    ).toContain('precoCentavos');
    const { adicionadoEm: _a, ...noDate } = validProduct;
    expect(issuePaths(productSchema.safeParse(noDate))).toContain('adicionadoEm');
  });

  test('product normalizes photo galleries and keeps single-image data compatible', () => {
    const { imagem, ...base } = validProduct;
    const gallery = productSchema.parse({
      ...base,
      imagens: ['frente.webp', 'costas.webp', 'frente.webp'],
    });
    expect(gallery.imagem).toBe('frente.webp');
    expect(gallery.imagens).toEqual(['frente.webp', 'costas.webp']);
    expect(productSchema.parse(validProduct).imagens).toEqual([imagem]);
    expect(
      productSchema.parse({ ...validProduct, imagens: ['costas.webp', imagem] }).imagens,
    ).toEqual([imagem, 'costas.webp']);
    expect(productSchema.safeParse(base).success).toBe(false);
    expect(productSchema.safeParse({ ...base, imagens: [] }).success).toBe(false);
  });

  test('wallpaper requires its file and a known category', () => {
    expect(issuePaths(wallpaperSchema.safeParse({ id: 'w', titulo: 'W' }))).toEqual(
      expect.arrayContaining(['descricao', 'categoria', 'arquivo', 'tamanho', 'tipo']),
    );
  });

  test('site config requires the contact e-mail and the six social urls', () => {
    expect(issuePaths(siteSchema.safeParse({ ...validSite, email: 'contato' }))).toContain('email');
    expect(issuePaths(siteSchema.safeParse({ ...validSite, formEndpoint: 'formspree' }))).toContain(
      'formEndpoint',
    );
    const { x: _x, ...social } = validSite.social;
    expect(issuePaths(siteSchema.safeParse({ ...validSite, social }))).toContain('social.x');
  });
});

describe('DATA-02', () => {
  test('DATA-02 invalid data reports file and field', () => {
    const dir = mkdtempSync(resolve('.astro/eutenia-invalid-'));
    const out = mkdtempSync(resolve('.astro/eutenia-out-'));
    try {
      for (const name of Object.keys(collectionFiles)) {
        const base = collectionFiles[name].split('/').pop()!;
        writeFileSync(join(dir, base), name === 'site' ? JSON.stringify(validSite) : '[]');
      }
      const { status: _s, ...noStatus } = validShow;
      writeFileSync(join(dir, 'shows.json'), JSON.stringify([noStatus]));
      const result = spawnSync(
        process.execPath,
        [resolve('node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out],
        {
          env: {
            ...process.env,
            EUTENIA_CONTENT: relative('.', dir).replaceAll('\\', '/'),
            FORCE_COLOR: '0',
            NO_COLOR: '1',
          },
          encoding: 'utf8',
        },
      );
      const output = (result.stdout + result.stderr).replaceAll('\\', '/');
      expect(result.status).not.toBe(0);
      expect(output).toContain(`${join(dir, 'shows.json').replaceAll('\\', '/')}:`);
      expect(output).toMatch(/^\s*\**status\**: /m);
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(out, { recursive: true, force: true });
    }
  }, 120_000);
});
