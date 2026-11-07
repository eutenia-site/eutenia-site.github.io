import { calendarDay, TIME_ZONE } from './format';

/** The fields the show rules read; Astro entries' `data` satisfies it. */
export interface ShowLike {
  data: Date | string;
  cidade: string;
  tipo: 'show' | 'festival';
}

export interface ShowTabs<T extends ShowLike> {
  proximos: T[];
  passados: T[];
  festivais: T[];
}

/** yyyymmdd of a [year, month, day] triple, for ordering calendar days. */
const dayKey = ([y, m, d]: [number, number, number]) => y * 10000 + m * 100 + d;

/** Calendar day of an instant in a time zone. */
function dayInZone(now: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return dayKey([get('year'), get('month'), get('day')]);
}

const showDay = (show: ShowLike) => dayKey(calendarDay(show.data));

const byCity = new Intl.Collator('pt-BR', { sensitivity: 'base' });

/** SHOW-03: upcoming through 23:59 of its own date in São Paulo. */
export function isUpcoming(show: ShowLike, now: Date, tz: string = TIME_ZONE): boolean {
  return showDay(show) >= dayInZone(now, tz);
}

/** SHOW-04/10: upcoming asc, past desc, upcoming festivals; same date by city name. */
export function showTabs<T extends ShowLike>(
  shows: readonly T[],
  now: Date,
  tz: string = TIME_ZONE,
): ShowTabs<T> {
  const asc = (a: T, b: T) => showDay(a) - showDay(b) || byCity.compare(a.cidade, b.cidade);
  const desc = (a: T, b: T) => showDay(b) - showDay(a) || byCity.compare(a.cidade, b.cidade);
  const proximos = shows.filter((s) => isUpcoming(s, now, tz)).sort(asc);
  const passados = shows.filter((s) => !isUpcoming(s, now, tz)).sort(desc);
  return { proximos, passados, festivais: proximos.filter((s) => s.tipo === 'festival') };
}
