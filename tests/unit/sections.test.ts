import { describe, expect, test } from 'vitest';
import { hasContent } from '../../src/lib/sections';

describe('hasContent (HOME-09, SHOW-09, FAS-04)', () => {
  test('empty data hides the section: [], {}, "", null, undefined', () => {
    expect(hasContent([])).toBe(false);
    expect(hasContent({})).toBe(false);
    expect(hasContent('')).toBe(false);
    expect(hasContent(null)).toBe(false);
    expect(hasContent(undefined)).toBe(false);
  });

  test('a blank string counts as empty', () => {
    expect(hasContent('   \n')).toBe(false);
  });

  test('filled data shows the section', () => {
    expect(hasContent([{ id: 'ouvintes', valor: '10K', rotulo: 'ouvintes' }])).toBe(true);
    expect(hasContent({ titulo: 'VIP Meet & Greet' })).toBe(true);
    expect(hasContent('https://t.me/eutenia')).toBe(true);
  });
});
