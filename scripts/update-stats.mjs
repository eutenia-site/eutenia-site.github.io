import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { instagramFollowers, spotifyMonthlyListeners, youtubeStatistics } from './public-stats.mjs';

function count(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error('Invalid count');
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new Error('Invalid count');
  return number;
}

export function formatTotal(value) {
  const divisor = value >= 1e9 ? 1e9 : value >= 1e6 ? 1e6 : value >= 1e3 ? 1e3 : 1;
  const suffix = divisor === 1e9 ? 'B' : divisor === 1e6 ? 'M' : divisor === 1e3 ? 'k' : '';
  const decimals = divisor >= 1e6 ? 1 : 0;
  return (
    (value > 0 ? '+' : '') +
    new Intl.NumberFormat('en-US', {
      useGrouping: false,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      roundingMode: 'trunc',
    }).format(value / divisor) +
    suffix
  );
}

export function parseStatistics(statistics) {
  if (!statistics || typeof statistics.hiddenSubscriberCount !== 'boolean') {
    throw new Error('Invalid statistics');
  }
  return {
    views: count(statistics.viewCount),
    hiddenSubscribers: statistics.hiddenSubscriberCount,
    subscribers: statistics.hiddenSubscriberCount ? null : count(statistics.subscriberCount),
  };
}

export async function updateYouTubeStats({
  statsFile = 'src/content/data/stats.json',
  apiKey = process.env.YOUTUBE_API_KEY,
  channelId = process.env.YOUTUBE_CHANNEL_ID,
  fetchImpl = fetch,
  log = { info: console.info, warn: console.warn },
} = {}) {
  const stats = JSON.parse(readFileSync(statsFile, 'utf8'));
  let values;
  try {
    let statistics;
    if (apiKey) {
      const endpoint = new URL('https://www.googleapis.com/youtube/v3/channels');
      endpoint.searchParams.set('part', 'statistics');
      endpoint.searchParams.set(channelId ? 'id' : 'forHandle', channelId || '@Eutenia');
      endpoint.searchParams.set('key', apiKey);
      const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error('YouTube request failed');
      const body = await response.json();
      if (body.items?.length !== 1) throw new Error('Channel not found');
      statistics = body.items[0].statistics;
    } else {
      const endpoint = channelId
        ? `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/about?hl=en`
        : 'https://www.youtube.com/@Eutenia/about?hl=en';
      const response = await fetchImpl(endpoint, {
        signal: AbortSignal.timeout(10_000),
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      });
      if (!response.ok) throw new Error('YouTube public page unavailable');
      statistics = youtubeStatistics(await response.text(), channelId);
    }
    values = parseStatistics(statistics);
    log.info(`YouTube statistics updated from ${apiKey ? 'the official API' : 'the public page'}.`);
  } catch {
    // Never log request URLs or raw errors: they may contain the API key.
    log.warn(
      'Could not refresh YouTube statistics; preserving the values already saved in stats.json.',
    );
    return;
  }

  const { views, subscribers, hiddenSubscribers } = values;
  const updated = stats
    .filter((stat) => !(hiddenSubscribers && stat.id === 'youtube_subscribers'))
    .map((stat) => {
      if (stat.id === 'youtube_views') return { ...stat, valor: formatTotal(views) };
      if (stat.id === 'youtube_subscribers') return { ...stat, valor: formatTotal(subscribers) };
      return stat;
    });
  writeFileSync(statsFile, JSON.stringify(updated, null, 2) + '\n');
}

export async function updateInstagramStats({
  statsFile = 'src/content/data/stats.json',
  fetchImpl = fetch,
  log = { info: console.info, warn: console.warn },
} = {}) {
  let followers;
  try {
    const response = await fetchImpl('https://www.instagram.com/euteniaoficial/', {
      signal: AbortSignal.timeout(10_000),
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!response.ok) throw new Error('Instagram public page unavailable');
    followers = instagramFollowers(await response.text());
    log.info('Instagram followers updated from the public page.');
  } catch {
    log.warn(
      'Could not refresh Instagram followers; preserving the values already saved in stats.json.',
    );
    return;
  }
  if (followers === undefined) return;
  const stats = JSON.parse(readFileSync(statsFile, 'utf8'));
  writeFileSync(
    statsFile,
    JSON.stringify(
      stats.map((stat) =>
        stat.id === 'instagram_seguidores' ? { ...stat, valor: formatTotal(followers) } : stat,
      ),
      null,
      2,
    ) + '\n',
  );
}

export async function updateSpotifyStats({
  statsFile = 'src/content/data/stats.json',
  fetchImpl = fetch,
  log = { info: console.info, warn: console.warn },
} = {}) {
  let listeners;
  try {
    const response = await fetchImpl('https://open.spotify.com/artist/1b1VNVxpK917LlNACwCIKM', {
      signal: AbortSignal.timeout(10_000),
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (!response.ok) throw new Error('Spotify public page unavailable');
    listeners = spotifyMonthlyListeners(await response.text());
  } catch {
    log.warn('Could not refresh Spotify monthly listeners; preserving stats.json.');
    return;
  }
  const stats = JSON.parse(readFileSync(statsFile, 'utf8'));
  writeFileSync(
    statsFile,
    JSON.stringify(
      stats.map((stat) =>
        stat.id === 'spotify_monthly_listeners' ? { ...stat, valor: formatTotal(listeners) } : stat,
      ),
      null,
      2,
    ) + '\n',
  );
  log.info('Spotify monthly listeners updated; manual total streams preserved.');
}

export async function updateStats() {
  // All three update the same JSON, so process them sequentially.
  await updateYouTubeStats();
  await updateInstagramStats();
  await updateSpotifyStats();
  const file = 'src/content/data/stats.json';
  const stats = JSON.parse(readFileSync(file, 'utf8'));
  // Normalize older manually entered decimal abbreviations as well.
  for (const stat of stats) stat.valor = normalizeStatValue(stat.valor);
  writeFileSync(file, JSON.stringify(stats, null, 2) + '\n');
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `stats=${JSON.stringify(stats)}\n`);
  }
}

export function normalizeStatValue(value) {
  const match = /^\+?(\d+(?:[.,]\d+)?)([kmb])\+?$/i.exec(value.trim());
  if (!match) return value;
  const unit = match[2].toLowerCase();
  const divisor = unit === 'b' ? 1e9 : unit === 'm' ? 1e6 : 1e3;
  return formatTotal(Number(match[1].replace(',', '.')) * divisor);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await updateStats();
}
