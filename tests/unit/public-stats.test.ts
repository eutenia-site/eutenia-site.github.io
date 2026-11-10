import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import {
  instagramFollowers,
  publicCount,
  spotifyMonthlyListeners,
  youtubeStatistics,
} from '../../scripts/public-stats.mjs';
import {
  updateInstagramStats,
  updateSpotifyStats,
  updateYouTubeStats,
} from '../../scripts/update-stats.mjs';

const channelId = 'UCbQwsKt8apfT9Nuq8GE35Nw';
const about = {
  channelId,
  subscriberCountText: '15,1 mil inscritos',
  viewCountText: '1.801.021 visualizações',
};
const youtube = (value = about) =>
  `<script nonce="example">var ytInitialData = ${JSON.stringify({
    recommended: { subscriberCountText: '447 inscritos', viewCountText: '10.421 visualizações' },
    onResponseReceivedEndpoints: [{ aboutChannelRenderer: { aboutChannelViewModel: value } }],
  })};</script>`;
const instagram = (
  value = '9,437 Followers, 82 Following, 268 Posts - EUTENIA (&#064;euteniaoficial)',
) => `<meta content="${value}" property="og:description" />`;

test.each([
  ['15,1 mil inscritos', 15100],
  ['15.1K subscribers', 15100],
  ['1.801.021 visualizações', 1801021],
  ['1,801,021 views', 1801021],
  ['9,437', 9437],
  ['9 437', 9437],
  ['9.4K', 9400],
  ['0 followers', 0],
])('parses publicly displayed metric %s', (text, expected) =>
  expect(publicCount(text)).toBe(expected),
);

test('reads only channel About metrics and validates the channel identity', () => {
  expect(youtubeStatistics(youtube())).toEqual({
    viewCount: '1801021',
    subscriberCount: '15100',
    hiddenSubscriberCount: false,
  });
  expect(() => youtubeStatistics(youtube({ ...about, channelId: 'another-channel' }))).toThrow();
  expect(() => youtubeStatistics('<html>Sign in</html>')).toThrow();
});

test('reads Instagram metadata with reversed attributes, entities and localized numbers', () => {
  expect(instagramFollowers(instagram())).toBe(9437);
  expect(instagramFollowers(instagram('9.437 Seguidores - EUTENIA (&#x40;euteniaoficial)'))).toBe(
    9437,
  );
  expect(() => instagramFollowers(instagram('9,437 Followers - Another (@another)'))).toThrow();
  expect(() => instagramFollowers('<html>Log in to Instagram</html>')).toThrow();
  expect(() => publicCount('9.4')).toThrow();
});

const directories: string[] = [];
function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'eutenia-public-stats-'));
  directories.push(dir);
  const statsFile = join(dir, 'stats.json');
  writeFileSync(
    statsFile,
    JSON.stringify([
      { id: 'youtube_views', valor: '+2M' },
      { id: 'youtube_subscribers', valor: '+15k' },
      { id: 'instagram_seguidores', valor: '9k+' },
      { id: 'spotify_streams', valor: '+1.5M' },
      { id: 'spotify_monthly_listeners', valor: '+1k' },
    ]),
  );
  return {
    statsFile,
    log: { info: vi.fn(), warn: vi.fn() },
  };
}
afterEach(() => {
  for (const dir of directories.splice(0)) {
    if (!dir.startsWith(join(tmpdir(), 'eutenia-public-stats-')))
      throw new Error('Unexpected test directory');
    rmSync(dir, { recursive: true, force: true });
  }
});
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

test('updates YouTube from its public page without credentials', async () => {
  const options = setup();
  const fetchImpl = vi.fn(
    async (_url: Parameters<typeof fetch>[0], _init?: RequestInit) => new Response(youtube()),
  );
  await updateYouTubeStats({ ...options, apiKey: '', channelId: '', fetchImpl });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(String(fetchImpl.mock.calls[0][0])).toBe('https://www.youtube.com/@Eutenia/about?hl=en');
  expect(read(options.statsFile).map((s: { valor: string }) => s.valor)).toEqual([
    '+1.8M',
    '+15k',
    '9k+',
    '+1.5M',
    '+1k',
  ]);
});

test('updates Instagram without credentials and preserves unrelated stats', async () => {
  const options = setup();
  await updateInstagramStats({ ...options, fetchImpl: async () => new Response(instagram()) });
  expect(read(options.statsFile).map((s: { valor: string }) => s.valor)).toEqual([
    '+2M',
    '+15k',
    '+9k',
    '+1.5M',
    '+1k',
  ]);
  const saved = readFileSync(options.statsFile, 'utf8');
  await updateInstagramStats({
    ...options,
    fetchImpl: async () => new Response('Log in', { status: 429 }),
  });
  expect(readFileSync(options.statsFile, 'utf8')).toBe(saved);
  expect(read(options.statsFile)[2].valor).toBe('+9k');
});

test('login walls and changed Instagram HTML never overwrite valid values with zero', async () => {
  const options = setup();
  const original = readFileSync(options.statsFile, 'utf8');
  await updateInstagramStats({
    ...options,
    fetchImpl: async () => new Response('<html>Please log in</html>'),
  });
  expect(readFileSync(options.statsFile, 'utf8')).toBe(original);
});

const spotify = (description = 'Artist · 2.8K monthly listeners.', id = '1b1VNVxpK917LlNACwCIKM') =>
  `<meta property="og:description" content="${description}"/><meta content="https://open.spotify.com/artist/${id}" property="og:url"/>`;

test('reads monthly Spotify listeners and rejects unrelated profiles or missing counts', () => {
  expect(spotifyMonthlyListeners(spotify())).toBe(2800);
  expect(spotifyMonthlyListeners(spotify('Artista · 2,8 mil ouvintes mensais.'))).toBe(2800);
  expect(() => spotifyMonthlyListeners(spotify('Artist · Spotify'))).toThrow();
  expect(() =>
    spotifyMonthlyListeners(spotify('Artist · 2.8K monthly listeners.', 'another')),
  ).toThrow();
});

test('Spotify updates its listener card, preserving the manual stream total', async () => {
  const options = setup();
  await updateSpotifyStats({ ...options, fetchImpl: async () => new Response(spotify()) });
  expect(read(options.statsFile).find((s: { id: string }) => s.id === 'spotify_streams')).toEqual({
    id: 'spotify_streams',
    valor: '+1.5M',
  });
  expect(
    read(options.statsFile).find((s: { id: string }) => s.id === 'spotify_monthly_listeners').valor,
  ).toBe('+2k');
  expect(read(options.statsFile)[0].valor).toBe('+2M');
  const saved = readFileSync(options.statsFile, 'utf8');
  await updateSpotifyStats({
    ...options,
    fetchImpl: async () => new Response('Blocked', { status: 429 }),
  });
  expect(readFileSync(options.statsFile, 'utf8')).toBe(saved);
  await updateSpotifyStats({
    ...options,
    fetchImpl: async () => new Response('<html>Log in</html>'),
  });
  expect(readFileSync(options.statsFile, 'utf8')).toBe(saved);
});
