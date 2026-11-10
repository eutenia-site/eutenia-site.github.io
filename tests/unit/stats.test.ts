import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { statValue } from '../../src/lib/stats';
import {
  formatTotal,
  normalizeStatValue,
  updateYouTubeStats as updateStats,
} from '../../scripts/update-stats.mjs';

const now = new Date('2026-11-10T12:00:00Z');
const directories: string[] = [];
const manual = [
  { id: 'youtube_views', valor: '+2M' },
  { id: 'youtube_subscribers', valor: '+15k' },
  { id: 'spotify_streams', valor: '+1.5M' },
];
const statistics = { viewCount: '2345678', subscriberCount: '17800', hiddenSubscriberCount: false };
function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'eutenia-stats-'));
  directories.push(dir);
  const statsFile = join(dir, 'stats.json');
  writeFileSync(statsFile, JSON.stringify(manual));
  return {
    statsFile,
    apiKey: 'test-key',
    channelId: '',
    log: { info: vi.fn(), warn: vi.fn() },
  };
}
afterEach(() => {
  for (const dir of directories.splice(0)) {
    if (!dir.startsWith(join(tmpdir(), 'eutenia-stats-')))
      throw new Error('Unexpected test directory');
    rmSync(dir, { recursive: true, force: true });
  }
});
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const success = () => Promise.resolve(Response.json({ items: [{ statistics }] }));

describe('statistics automation', () => {
  test('years roll over in Sao Paulo, independently of the server timezone', () => {
    const stat = { anoInicial: 2012, valor: '14 anos' };
    expect(statValue(stat, new Date('2027-01-01T02:59:59Z'))).toBe('14 anos');
    expect(statValue(stat, new Date('2027-01-01T03:00:00Z'))).toBe('15 anos');
    expect(statValue({ valor: '+2M' }, now)).toBe('+2M');
  });

  test('compact counts never round up to an unreached milestone', () => {
    expect(formatTotal(999999)).toBe('+999k');
    expect(formatTotal(1999999)).toBe('+1.9M');
    expect(formatTotal(0)).toBe('0');
  });
  test('normalizes legacy manual abbreviations to the same dot format', () => {
    expect(normalizeStatValue('+1,5M')).toBe('+1.5M');
    expect(normalizeStatValue('9,4k')).toBe('+9k');
    expect(normalizeStatValue('9k+')).toBe('+9k');
    expect(normalizeStatValue('14 anos')).toBe('14 anos');
    expect(formatTotal(1000000)).toBe('+1.0M');
  });

  test('one official API call updates only YouTube and saves no credentials', async () => {
    const options = setup();
    const fetchImpl = vi.fn(async (_url: Parameters<typeof fetch>[0], _options?: RequestInit) =>
      success(),
    );
    await updateStats({ ...options, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const endpoint = fetchImpl.mock.calls[0][0] as URL;
    expect(endpoint.origin).toBe('https://www.googleapis.com');
    expect(endpoint.searchParams.get('forHandle')).toBe('@Eutenia');
    expect(read(options.statsFile)).toEqual([
      { ...manual[0], valor: '+2.3M' },
      { ...manual[1], valor: '+17k' },
      manual[2],
    ]);
    expect(readFileSync(options.statsFile, 'utf8')).not.toContain('test-key');
  });

  test('an API outage keeps the last values saved in stats.json', async () => {
    const options = setup();
    await updateStats({ ...options, fetchImpl: success });
    const saved = readFileSync(options.statsFile, 'utf8');
    await updateStats({ ...options, fetchImpl: async () => new Response('', { status: 503 }) });
    expect(read(options.statsFile)[0].valor).toBe('+2.3M');
    expect(readFileSync(options.statsFile, 'utf8')).toBe(saved);
  });

  test('a blocked public page keeps stats.json byte for byte', async () => {
    const options = setup();
    const before = readFileSync(options.statsFile, 'utf8');
    const fetchImpl = vi.fn(async () => new Response('', { status: 429 }));
    await updateStats({ ...options, apiKey: '', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(readFileSync(options.statsFile, 'utf8')).toBe(before);
  });

  test('invalid API data cannot replace saved values or reset counters to zero', async () => {
    const options = setup();
    await updateStats({ ...options, fetchImpl: success });
    const saved = readFileSync(options.statsFile, 'utf8');
    await updateStats({
      ...options,
      fetchImpl: async () =>
        Response.json({ items: [{ statistics: { ...statistics, viewCount: 'invalid' } }] }),
    });
    expect(readFileSync(options.statsFile, 'utf8')).toBe(saved);
    expect(read(options.statsFile)[0].valor).toBe('+2.3M');
  });

  test('hidden subscriber counts are omitted instead of exposing stale counts', async () => {
    const options = setup();
    await updateStats({
      ...options,
      fetchImpl: async () =>
        Response.json({
          items: [{ statistics: { viewCount: '42', hiddenSubscriberCount: true } }],
        }),
    });
    expect(read(options.statsFile)).toEqual([{ ...manual[0], valor: '+42' }, manual[2]]);
  });
});
