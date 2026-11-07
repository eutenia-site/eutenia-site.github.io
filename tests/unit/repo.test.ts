import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('DATA-03', () => {
  test('DATA-03 every placeholder file is listed in PLACEHOLDERS.md', () => {
    const manifest = readFileSync('PLACEHOLDERS.md', 'utf8');
    const files = walk('public/placeholders');
    expect(files.length).toBeGreaterThan(0);
    const missing = files.filter((f) => !manifest.includes(`\`${relative('.', f)}\``));
    expect(missing).toEqual([]);
  });

  test('every placeholder path in the data files exists under public/', () => {
    const data = ['products', 'wallpapers', 'press', 'fan-kit']
      .map((name) => readFileSync(`src/content/data/${name}.json`, 'utf8'))
      .join('\n');
    const paths = [...data.matchAll(/"(placeholders\/[^"]+)"/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((p) => !existsSync(join('public', p)))).toEqual([]);
  });
});
