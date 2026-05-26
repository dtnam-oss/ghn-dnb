import type { DataRow, Filters, Granularity } from './types';

export const DEFAULT_FILTERS: Filters = {
  vung: [],
  tinh: [],
  am: [],
  buuCuc: [],
  from: null,
  to: null,
  granularity: 'day',
  loaiHang: [],
};

function parseList(s: string | null): string[] {
  if (!s) return [];
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

export function parseFilters(sp: URLSearchParams): Filters {
  const granularityRaw = sp.get('granularity') || 'day';
  const granularity: Granularity = granularityRaw === 'week' || granularityRaw === 'month' ? granularityRaw : 'day';
  return {
    vung: parseList(sp.get('vung')),
    tinh: parseList(sp.get('tinh')),
    am: parseList(sp.get('am')),
    buuCuc: parseList(sp.get('bc')),
    from: sp.get('from'),
    to: sp.get('to'),
    granularity,
    loaiHang: parseList(sp.get('loaiHang')),
  };
}

export function filtersToSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.vung.length) sp.set('vung', f.vung.join(','));
  if (f.tinh.length) sp.set('tinh', f.tinh.join(','));
  if (f.am.length) sp.set('am', f.am.join(','));
  if (f.buuCuc.length) sp.set('bc', f.buuCuc.join(','));
  if (f.from) sp.set('from', f.from);
  if (f.to) sp.set('to', f.to);
  if (f.granularity !== 'day') sp.set('granularity', f.granularity);
  if (f.loaiHang.length) sp.set('loaiHang', f.loaiHang.join(','));
  return sp;
}

export function applyFilters(rows: DataRow[], f: Filters): DataRow[] {
  return rows.filter(r => {
    if (f.vung.length && !f.vung.includes(r.vung)) return false;
    if (f.tinh.length && !f.tinh.includes(r.tinh)) return false;
    if (f.am.length && !f.am.includes(r.amId)) return false;
    if (f.buuCuc.length && !f.buuCuc.includes(r.buuCuc)) return false;
    if (f.from && r.dateISO < f.from) return false;
    if (f.to && r.dateISO > f.to) return false;
    if (f.loaiHang.length && !f.loaiHang.includes(r.loaiHang)) return false;
    return true;
  });
}

export interface DimensionTree {
  vungs: string[];
  tinhByVung: Map<string, string[]>;
  amByTinh: Map<string, { id: string; name: string }[]>;
  buuCucByAm: Map<string, string[]>;
}

export function buildDimensionTree(rows: DataRow[]): DimensionTree {
  const vungs = new Set<string>();
  const tinhByVung = new Map<string, Set<string>>();
  const amByTinh = new Map<string, Map<string, string>>();
  const buuCucByAm = new Map<string, Set<string>>();
  for (const r of rows) {
    vungs.add(r.vung);
    if (!tinhByVung.has(r.vung)) tinhByVung.set(r.vung, new Set());
    tinhByVung.get(r.vung)!.add(r.tinh);
    if (!amByTinh.has(r.tinh)) amByTinh.set(r.tinh, new Map());
    if (r.amId) amByTinh.get(r.tinh)!.set(r.amId, r.amName);
    if (!buuCucByAm.has(r.amId)) buuCucByAm.set(r.amId, new Set());
    buuCucByAm.get(r.amId)!.add(r.buuCuc);
  }
  return {
    vungs: [...vungs].sort(),
    tinhByVung: new Map([...tinhByVung].map(([k, v]) => [k, [...v].sort()])),
    amByTinh: new Map(
      [...amByTinh].map(([k, m]) => [
        k,
        [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
      ])
    ),
    buuCucByAm: new Map([...buuCucByAm].map(([k, v]) => [k, [...v].sort()])),
  };
}

export function defaultDateRange(rows: DataRow[]): { from: string; to: string } {
  const dates = rows.map(r => r.dateISO).filter(Boolean).sort();
  const to = dates[dates.length - 1] || '';
  const fromIdx = Math.max(0, dates.length - 14);
  const from = dates[fromIdx] || '';
  return { from, to };
}
