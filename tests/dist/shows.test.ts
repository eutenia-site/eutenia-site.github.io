import { describe, expect, test } from 'vitest';
import vip from '../../src/content/data/vip.json' with { type: 'json' };
import { readPage, textOf } from './html';

const html = readPage('shows/index.html');

describe('Shows (dist, real content)', () => {
  test('SHOW-09 VIP card omitted when VIP data empty', () => {
    expect(vip).toHaveLength(0);
    expect(html).not.toMatch(/data-vip/);
    const text = textOf(html);
    expect(text).not.toMatch(/Garantir upgrade VIP/i);
    expect(text).not.toMatch(/Experiência exclusiva/i);
    // The rest of the page is still there.
    expect(text).toContain('Contratar a banda');
  });
});
