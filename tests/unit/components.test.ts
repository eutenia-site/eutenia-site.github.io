import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';
import pandora from '../../src/assets/capas/pandora.jpg';
import CoverTile from '../../src/components/ui/CoverTile.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('CoverTile', () => {
  test('DATA-05 release without cover renders the Eutenia mark tile', async () => {
    const html = await container.renderToString(CoverTile, { props: { titulo: 'Sem Arte' } });

    expect(html).not.toMatch(/<img\b/);
    const tile = /<div\b[^>]*data-cover-fallback[^>]*>([\s\S]*?)<\/div>/.exec(html);
    expect(tile, 'fallback tile').not.toBeNull();
    expect(tile![0]).toMatch(/role="img"/);
    expect(tile![0]).toMatch(/aria-label="Sem Arte \(sem capa\)"/);
    expect(tile![0]).toMatch(/bg-surface-container-highest/);
    expect(tile![1].replace(/<[^>]+>/g, '').trim()).toBe('Eutenia');

    // The same release with a cover shows the cover, not the mark.
    const withCover = await container.renderToString(CoverTile, {
      props: { titulo: 'Pandora', capa: pandora },
    });
    expect(withCover).toMatch(/<img\b[^>]*alt="Capa de Pandora"/);
    expect(withCover).not.toMatch(/data-cover-fallback/);
  });
});
