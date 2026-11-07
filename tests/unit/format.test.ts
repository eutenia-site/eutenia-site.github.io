import { describe, expect, test } from 'vitest';
import { formatDuration, formatPrice, formatShowDate } from '../../src/lib/format';

describe('formatPrice (LOJA-05)', () => {
  test('LOJA-05 formats cents as R$ 119,90', () => {
    expect(formatPrice(11990)).toBe('R$ 119,90');
  });
  test('formats thousands with a dot and zero cents', () => {
    expect(formatPrice(129900)).toBe('R$ 1.299,00');
    expect(formatPrice(5)).toBe('R$ 0,05');
  });
});

describe('formatDuration (DISC-04)', () => {
  test('DISC-04 formats seconds as m:ss', () => {
    expect(formatDuration(244)).toBe('4:04');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(0)).toBe('0:00');
  });
  test('keeps counting minutes past one hour', () => {
    expect(formatDuration(3600)).toBe('60:00');
  });
});

describe('formatShowDate', () => {
  test('splits a calendar date into day, pt-BR month and year', () => {
    expect(formatShowDate('2025-06-21')).toEqual({ dia: '21', mes: 'JUN', ano: '2025' });
    expect(formatShowDate('2099-02-03')).toEqual({ dia: '03', mes: 'FEV', ano: '2099' });
  });
  test('a date-only Date (UTC midnight) keeps its calendar day', () => {
    expect(formatShowDate(new Date('2025-05-10'))).toEqual({ dia: '10', mes: 'MAI', ano: '2025' });
  });
  test('an instant is read in America/Sao_Paulo', () => {
    // 02:00 UTC on 1 Jan is still 31 Dec in São Paulo (UTC-3)
    expect(formatShowDate(new Date('2026-01-01T02:00:00Z'))).toEqual({
      dia: '31',
      mes: 'DEZ',
      ano: '2025',
    });
  });
});
