import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('smoke: build wrote dist/index.html in pt-BR', () => {
  const file = new URL('../../dist/index.html', import.meta.url);
  expect(existsSync(file)).toBe(true);
  expect(readFileSync(file, 'utf8')).toContain('lang="pt-BR"');
});
