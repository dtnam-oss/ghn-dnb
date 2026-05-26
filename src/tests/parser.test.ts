import { describe, it, expect } from 'vitest';
import { parsePercent, parseNumber, parseLeadtime, parseDateString } from '../lib/sheets-parser';

describe('parsePercent', () => {
  it('parses VN comma format', () => {
    expect(parsePercent('89,16%')).toBeCloseTo(0.8916, 4);
    expect(parsePercent('100,00%')).toBe(1);
    expect(parsePercent('0,00%')).toBe(0);
  });
  it('handles missing values', () => {
    expect(parsePercent('')).toBe(0);
    expect(parsePercent('-')).toBe(0);
    expect(parsePercent(null)).toBe(0);
  });
});

describe('parseLeadtime', () => {
  it('returns null for dash', () => {
    expect(parseLeadtime('-')).toBeNull();
    expect(parseLeadtime('')).toBeNull();
  });
  it('parses number with comma decimal', () => {
    expect(parseLeadtime('6,066')).toBeCloseTo(6.066, 3);
    expect(parseLeadtime('32,25663717')).toBeCloseTo(32.2566, 4);
  });
});

describe('parseNumber', () => {
  it('handles VN thousands', () => {
    expect(parseNumber('1.234')).toBe(1234);
    expect(parseNumber('406')).toBe(406);
    expect(parseNumber('-')).toBe(0);
  });
});

describe('parseDateString', () => {
  it('extracts ISO date from VN format', () => {
    const r = parseDateString('2026-05-01 - Thứ 6');
    expect(r.dateISO).toBe('2026-05-01');
  });
  it('handles missing input', () => {
    expect(parseDateString('').dateISO).toBe('');
  });
});
