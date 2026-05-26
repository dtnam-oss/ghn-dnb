import { describe, it, expect } from 'vitest';
import { aggregateByTime, aggregateOverall, aggregateRanking } from '../lib/aggregations';
import { detectAlerts } from '../lib/alerts';
import { DEFAULT_THRESHOLDS, type DataRow } from '../lib/types';

function mkRow(p: Partial<DataRow> = {}): DataRow {
  return {
    capQuanLy: 'A', buuCuc: 'BC X', loaiHang: 'Hàng Mới Ca 1', date: '01/05',
    dateISO: '2026-05-01', volume: 100, pctGan: 1, pctGTC: 0.8, pctChuyenTra: 0,
    leadtime: 10, slGTC: 80, slChuyenTra: 0, slGan: 100, slTra: 0, slTon: 20,
    slChuaGan: 0, pctChuaGan: 0, pctTon: 0.2, hangMoiVeTrongNgay: 100,
    vung: 'DNB', tinh: 'Đồng Nai', am: '111-A', amId: '111', amName: 'A',
    ...p,
  };
}

describe('aggregateOverall', () => {
  it('weighted % by volume', () => {
    const rows = [mkRow({ volume: 100, slGTC: 80 }), mkRow({ volume: 200, slGTC: 100 })];
    const out = aggregateOverall(rows);
    expect(out.volume).toBe(300);
    expect(out.pctGTC).toBeCloseTo(180 / 300, 4);
  });
  it('skips null leadtime in weighted avg', () => {
    const rows = [mkRow({ volume: 100, leadtime: 10 }), mkRow({ volume: 100, leadtime: null })];
    const out = aggregateOverall(rows);
    expect(out.leadtime).toBeCloseTo(10, 4);
  });
});

describe('aggregateByTime', () => {
  it('groups by day', () => {
    const rows = [
      mkRow({ dateISO: '2026-05-01' }),
      mkRow({ dateISO: '2026-05-01' }),
      mkRow({ dateISO: '2026-05-02' }),
    ];
    const out = aggregateByTime(rows, 'day');
    expect(out.length).toBe(2);
  });
});

describe('aggregateRanking', () => {
  it('groups by AM and counts BC', () => {
    const rows = [
      mkRow({ amId: '111', buuCuc: 'BC1' }),
      mkRow({ amId: '111', buuCuc: 'BC2' }),
      mkRow({ amId: '222', buuCuc: 'BC3' }),
    ];
    const out = aggregateRanking(rows, 'am');
    expect(out.length).toBe(2);
    expect(out.find(x => x.groupKey === '111')?.buuCucCount).toBe(2);
  });
});

describe('detectAlerts', () => {
  it('flags %Ton over threshold', () => {
    const rows = [mkRow({ pctTon: 0.5, volume: 100 })];
    const alerts = detectAlerts(rows, DEFAULT_THRESHOLDS);
    expect(alerts.some(a => a.metric === 'pctTon')).toBe(true);
  });
  it('skips rows with zero volume', () => {
    const rows = [mkRow({ volume: 0, pctTon: 0.9 })];
    const alerts = detectAlerts(rows, DEFAULT_THRESHOLDS);
    expect(alerts.length).toBe(0);
  });
});
