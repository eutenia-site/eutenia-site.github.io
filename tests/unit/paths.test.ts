import { describe, expect, test } from 'vitest';
import { url } from '../../src/lib/paths';

describe('url (NAV-08)', () => {
  test('NAV-08 page paths sit under base /eutenia-site/ with one trailing slash', () => {
    const base = '/eutenia-site/';
    expect(url('/', base)).toBe('/eutenia-site/');
    expect(url('', base)).toBe('/eutenia-site/');
    expect(url('/shows', base)).toBe('/eutenia-site/shows/');
    expect(url('shows', base)).toBe('/eutenia-site/shows/');
    expect(url('/shows/', base)).toBe('/eutenia-site/shows/');
    expect(url('/shows//', base)).toBe('/eutenia-site/shows/');
  });

  test('NAV-08 page paths with base / have no double slash', () => {
    expect(url('/', '/')).toBe('/');
    expect(url('/discografia', '/')).toBe('/discografia/');
    expect(url('contato/', '/')).toBe('/contato/');
  });

  test('a base without its slashes is normalised', () => {
    expect(url('/loja', '/eutenia-site')).toBe('/eutenia-site/loja/');
    expect(url('/loja', 'eutenia-site')).toBe('/eutenia-site/loja/');
    expect(url('/loja', '')).toBe('/loja/');
  });

  test('file paths keep no trailing slash', () => {
    expect(url('/placeholders/produto-1.jpg', '/eutenia-site/')).toBe(
      '/eutenia-site/placeholders/produto-1.jpg',
    );
    expect(url('favicon.svg', '/')).toBe('/favicon.svg');
  });

  test('query and hash stay after the trailing slash', () => {
    expect(url('/discografia#videoclipes', '/eutenia-site/')).toBe(
      '/eutenia-site/discografia/#videoclipes',
    );
    expect(url('/contato?departamento=booking', '/')).toBe('/contato/?departamento=booking');
  });

  test('external and anchor URLs are untouched', () => {
    const base = '/eutenia-site/';
    expect(url('https://open.spotify.com/artist/x', base)).toBe(
      'https://open.spotify.com/artist/x',
    );
    expect(url('http://example.com', base)).toBe('http://example.com');
    expect(url('mailto:contato@eutenia.com.br?subject=Booking', base)).toBe(
      'mailto:contato@eutenia.com.br?subject=Booking',
    );
    expect(url('//cdn.example.com/a.js', base)).toBe('//cdn.example.com/a.js');
    expect(url('#conteudo', base)).toBe('#conteudo');
  });

  test('is idempotent on its own output for the same base', () => {
    expect(url(url('/shows', '/'), '/')).toBe('/shows/');
  });

  test('defaults to the configured BASE_URL', () => {
    expect(url('/shows')).toBe(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/shows/`);
  });
});
