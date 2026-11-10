export interface Stat {
  id: string;
  valor: string;
  rotulo: string;
  ordem?: number;
  anoInicial?: number;
}

/** Calendar years in the band's timezone; no invented anniversary date. */
export function statValue(stat: Pick<Stat, 'valor' | 'anoInicial'>, now = new Date()): string {
  if (stat.anoInicial === undefined) return stat.valor;
  const year = Number(
    new Intl.DateTimeFormat('en', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
    }).format(now),
  );
  return year >= stat.anoInicial ? `${year - stat.anoInicial} anos` : stat.valor;
}
