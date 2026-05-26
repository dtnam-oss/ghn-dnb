import { startOfISOWeek, format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { AggregatedBucket, DataRow, Granularity, RankingRow } from './types';

function bucketKey(dateISO: string, granularity: Granularity): { key: string; label: string } {
  if (!dateISO) return { key: '', label: '' };
  const d = parseISO(dateISO);
  if (granularity === 'day') {
    return { key: dateISO, label: format(d, 'dd/MM', { locale: vi }) };
  }
  if (granularity === 'week') {
    const start = startOfISOWeek(d);
    const key = format(start, 'yyyy-MM-dd');
    return { key, label: `T${format(start, 'I')} (${format(start, 'dd/MM')})` };
  }
  const key = format(d, 'yyyy-MM');
  return { key, label: format(d, 'MM/yyyy') };
}

interface Accum {
  volume: number;
  slGTC: number;
  slGan: number;
  slChuyenTra: number;
  slTon: number;
  slChuaGan: number;
  leadtimeSum: number;
  leadtimeWeight: number;
}

function newAccum(): Accum {
  return { volume: 0, slGTC: 0, slGan: 0, slChuyenTra: 0, slTon: 0, slChuaGan: 0, leadtimeSum: 0, leadtimeWeight: 0 };
}

function addRow(a: Accum, r: DataRow): void {
  a.volume += r.volume;
  a.slGTC += r.slGTC;
  a.slGan += r.slGan;
  a.slChuyenTra += r.slChuyenTra;
  a.slTon += r.slTon;
  a.slChuaGan += r.slChuaGan;
  if (r.leadtime != null && r.volume > 0) {
    a.leadtimeSum += r.leadtime * r.volume;
    a.leadtimeWeight += r.volume;
  }
}

function finalize(a: Accum, key: string, label: string): AggregatedBucket {
  const safe = (n: number, d: number) => (d > 0 ? n / d : 0);
  return {
    key,
    label,
    volume: a.volume,
    pctGTC: safe(a.slGTC, a.volume),
    pctGan: safe(a.slGan, a.volume),
    pctChuyenTra: safe(a.slChuyenTra, a.volume),
    pctTon: safe(a.slTon, a.volume),
    pctChuaGan: safe(a.slChuaGan, a.volume),
    leadtime: a.leadtimeWeight > 0 ? a.leadtimeSum / a.leadtimeWeight : null,
  };
}

export function aggregateByTime(rows: DataRow[], granularity: Granularity): AggregatedBucket[] {
  const map = new Map<string, { accum: Accum; label: string }>();
  for (const r of rows) {
    const { key, label } = bucketKey(r.dateISO, granularity);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { accum: newAccum(), label });
    addRow(map.get(key)!.accum, r);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => finalize(v.accum, key, v.label));
}

export function aggregateOverall(rows: DataRow[]): AggregatedBucket {
  const accum = newAccum();
  for (const r of rows) addRow(accum, r);
  return finalize(accum, 'overall', 'Tổng');
}

export type GroupBy = 'am' | 'buuCuc' | 'tinh' | 'vung';

function groupValue(r: DataRow, by: GroupBy): { key: string; label: string } {
  if (by === 'am') return { key: r.amId || r.am, label: r.amName || r.am };
  if (by === 'buuCuc') return { key: r.buuCuc, label: r.buuCuc };
  if (by === 'tinh') return { key: r.tinh, label: r.tinh };
  return { key: r.vung, label: r.vung };
}

export function aggregateRanking(rows: DataRow[], by: GroupBy): RankingRow[] {
  const map = new Map<string, { accum: Accum; label: string; buuCucs: Set<string> }>();
  for (const r of rows) {
    const { key, label } = groupValue(r, by);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { accum: newAccum(), label, buuCucs: new Set() });
    const entry = map.get(key)!;
    addRow(entry.accum, r);
    if (r.buuCuc) entry.buuCucs.add(r.buuCuc);
  }
  return [...map.entries()].map(([key, v]) => {
    const safe = (n: number, d: number) => (d > 0 ? n / d : 0);
    return {
      groupKey: key,
      groupLabel: v.label,
      volume: v.accum.volume,
      pctGTC: safe(v.accum.slGTC, v.accum.volume),
      pctTon: safe(v.accum.slTon, v.accum.volume),
      pctChuaGan: safe(v.accum.slChuaGan, v.accum.volume),
      leadtime: v.accum.leadtimeWeight > 0 ? v.accum.leadtimeSum / v.accum.leadtimeWeight : null,
      buuCucCount: v.buuCucs.size,
    };
  });
}

export function aggregateByLoaiHang(rows: DataRow[]): { loaiHang: string; bucket: AggregatedBucket }[] {
  const map = new Map<string, Accum>();
  for (const r of rows) {
    if (!map.has(r.loaiHang)) map.set(r.loaiHang, newAccum());
    addRow(map.get(r.loaiHang)!, r);
  }
  return [...map.entries()].map(([k, accum]) => ({ loaiHang: k, bucket: finalize(accum, k, k) }));
}

export interface HeatmapCell {
  groupKey: string;
  groupLabel: string;
  dateISO: string;
  value: number;
  volume: number;
}

export function buildHeatmap(rows: DataRow[], metric: 'pctTon' | 'pctGTC'): HeatmapCell[] {
  const map = new Map<string, Map<string, Accum>>();
  for (const r of rows) {
    if (!map.has(r.buuCuc)) map.set(r.buuCuc, new Map());
    const inner = map.get(r.buuCuc)!;
    if (!inner.has(r.dateISO)) inner.set(r.dateISO, newAccum());
    addRow(inner.get(r.dateISO)!, r);
  }
  const out: HeatmapCell[] = [];
  for (const [bc, inner] of map) {
    for (const [date, accum] of inner) {
      const num = metric === 'pctTon' ? accum.slTon : accum.slGTC;
      out.push({
        groupKey: bc,
        groupLabel: bc,
        dateISO: date,
        value: accum.volume > 0 ? num / accum.volume : 0,
        volume: accum.volume,
      });
    }
  }
  return out;
}
