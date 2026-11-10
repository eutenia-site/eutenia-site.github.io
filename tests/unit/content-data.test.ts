import { readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, test } from 'vitest';
import { showSchema, siteSchema, statSchema, vipSchema } from '../../src/content.config';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

const optional: Record<string, z.ZodType> = {
  shows: showSchema,
  vip: vipSchema,
  stats: statSchema,
};

describe('optional collections (AD-002, Q21)', () => {
  test.each(Object.keys(optional))('real %s data validates when configured', (name) => {
    for (const item of read(`src/content/data/${name}.json`)) {
      expect(optional[name].safeParse(item).success).toBe(true);
    }
  });

  test.each(Object.keys(optional))('_exemplos/%s.json is filled and validates', (name) => {
    const items = read(`src/content/_exemplos/${name}.json`);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      const result = optional[name].safeParse(item);
      expect(result.success, `${name}/${item.id}: ${result.error?.message}`).toBe(true);
    }
  });
});

describe('site config (AD-007)', () => {
  test('site.json validates with contatoeutenia@gmail.com, the six socials and empty endpoints', () => {
    const site = read('src/config/site.json');
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.email).toBe('contatoeutenia@gmail.com');
    expect(site.social).toEqual({
      spotify: 'https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM',
      instagram: 'https://www.instagram.com/euteniaoficial/',
      youtube: 'https://www.youtube.com/Eutenia',
      facebook: 'https://www.facebook.com/eutenia',
      x: 'https://twitter.com/EuteniaOficial',
      tiktok: 'https://www.tiktok.com/@euteniaoficial',
    });
    for (const key of ['formEndpoint', 'newsletterEndpoint', 'votoCidadeEndpoint', 'lojaUrl']) {
      expect(site[key], key).toBe('');
    }
  });
});
