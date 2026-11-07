import { describe, expect, test } from 'vitest';
import { isUpcoming, showTabs, type ShowLike } from '../../src/lib/shows';

type Show = ShowLike & { id: string };
const show = (
  id: string,
  data: string,
  cidade = 'Curitiba',
  tipo: Show['tipo'] = 'show',
): Show => ({
  id,
  data,
  cidade,
  tipo,
});
const ids = (list: Show[]) => list.map((s) => s.id);

describe('isUpcoming (SHOW-03)', () => {
  const today = show('hoje', '2026-11-07');

  test('SHOW-03 show dated today in São Paulo is upcoming', () => {
    // 00:00 BRT of the show date
    expect(isUpcoming(today, new Date('2026-11-07T00:00:00-03:00'))).toBe(true);
    // 23:59:59 BRT of the show date
    expect(isUpcoming(today, new Date('2026-11-07T23:59:59-03:00'))).toBe(true);
    // already 2026-11-08 in UTC, still 2026-11-07 in BRT
    expect(isUpcoming(today, new Date('2026-11-08T00:00:00Z'))).toBe(true);
    expect(isUpcoming(today, new Date('2026-11-08T02:59:59Z'))).toBe(true);
  });

  test('a show becomes past at 00:00 BRT of the next day', () => {
    expect(isUpcoming(today, new Date('2026-11-08T00:00:00-03:00'))).toBe(false);
    expect(isUpcoming(today, new Date('2026-11-08T03:00:00Z'))).toBe(false);
  });

  test('a show on a later date is upcoming, an earlier one is past', () => {
    const now = new Date('2026-11-07T12:00:00-03:00');
    expect(isUpcoming(show('a', '2026-11-08'), now)).toBe(true);
    expect(isUpcoming(show('b', '2027-01-01'), now)).toBe(true);
    expect(isUpcoming(show('c', '2026-11-06'), now)).toBe(false);
  });

  test('reads Date values parsed from date-only strings as their calendar day', () => {
    const asDate = { ...today, data: new Date('2026-11-07') };
    expect(isUpcoming(asDate, new Date('2026-11-07T23:59:59-03:00'))).toBe(true);
    expect(isUpcoming(asDate, new Date('2026-11-08T00:00:00-03:00'))).toBe(false);
  });
});

describe('showTabs (SHOW-04, SHOW-10)', () => {
  const now = new Date('2026-11-07T20:00:00-03:00');

  test('SHOW-04 tabs order upcoming asc, past desc, festivals upcoming only', () => {
    const shows = [
      show('fut-2', '2027-02-10'),
      show('pas-1', '2026-10-01'),
      show('fest-fut', '2026-12-05', 'Recife', 'festival'),
      show('hoje', '2026-11-07'),
      show('fest-pas', '2026-08-20', 'Natal', 'festival'),
      show('pas-2', '2026-11-06'),
      show('fut-1', '2026-11-20'),
    ];
    const tabs = showTabs(shows, now);
    expect(ids(tabs.proximos)).toEqual(['hoje', 'fut-1', 'fest-fut', 'fut-2']);
    expect(ids(tabs.passados)).toEqual(['pas-2', 'pas-1', 'fest-pas']);
    expect(ids(tabs.festivais)).toEqual(['fest-fut']);
  });

  test('SHOW-10 same-date shows ordered by city', () => {
    const shows = [
      show('sp', '2026-12-01', 'São Paulo'),
      show('bh', '2026-12-01', 'Belo Horizonte'),
      show('ar', '2026-12-01', 'Aracaju'),
      show('s1', '2026-01-10', 'Salvador'),
      show('ab', '2026-01-10', 'Águas Claras'),
      show('cu', '2026-01-10', 'Curitiba'),
    ];
    const tabs = showTabs(shows, now);
    expect(ids(tabs.proximos)).toEqual(['ar', 'bh', 'sp']);
    // pt-BR collation: "Águas" sorts with A, not after Z
    expect(ids(tabs.passados)).toEqual(['ab', 'cu', 's1']);
  });

  test('empty input yields three empty tabs', () => {
    expect(showTabs([], now)).toEqual({ proximos: [], passados: [], festivais: [] });
  });

  test('does not mutate the input', () => {
    const shows = [show('b', '2027-01-02'), show('a', '2027-01-01')];
    showTabs(shows, now);
    expect(ids(shows)).toEqual(['b', 'a']);
  });
});
