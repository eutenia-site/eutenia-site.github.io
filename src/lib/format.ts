const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export const TIME_ZONE = 'America/Sao_Paulo';

const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 11990 → "R$ 119,90" (plain space after the symbol). */
export function formatPrice(cents: number): string {
  return price.format(cents / 100).replace(/\s/g, ' ');
}

/** 244 → "4:04"; minutes do not roll into hours. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface ShowDateParts {
  dia: string;
  mes: string;
  ano: string;
}

/**
 * Calendar day of a show. A date-only value ("2025-06-21" or a Date at UTC midnight,
 * which is how date-only strings parse) is taken as is; any other instant is read in
 * America/Sao_Paulo.
 */
export function formatShowDate(value: string | Date): ShowDateParts {
  const [ano, mes, dia] = calendarDay(value);
  return { dia: String(dia).padStart(2, '0'), mes: MESES[mes - 1], ano: String(ano) };
}

/** [year, month 1-12, day] of a show date in São Paulo. */
export function calendarDay(value: string | Date): [number, number, number] {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return [y, m, d];
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  ) {
    return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return [get('year'), get('month'), get('day')];
}
