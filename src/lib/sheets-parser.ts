import Papa from 'papaparse';
import type { CoCauRow, DataRow, SheetSnapshot } from './types';

export function parsePercent(raw: unknown): number {
  if (raw == null || raw === '' || raw === '-') return 0;
  const s = String(raw).trim().replace('%', '').replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  if (!isFinite(n)) return 0;
  return n / 100;
}

export function parseNumber(raw: unknown): number {
  if (raw == null || raw === '' || raw === '-') return 0;
  const s = String(raw).trim().replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

export function parseLeadtime(raw: unknown): number | null {
  if (raw == null || raw === '' || raw === '-') return null;
  const s = String(raw).trim().replace(',', '.');
  const n = Number(s);
  return isFinite(n) ? n : null;
}

const VN_DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function parseDateString(raw: string): { dateISO: string; label: string } {
  if (!raw) return { dateISO: '', label: '' };
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m && m[1]) {
    const iso = m[1];
    const date = new Date(iso + 'T00:00:00Z');
    const dayName = VN_DAYS[date.getUTCDay()] ?? '';
    return { dateISO: iso, label: `${iso} - ${dayName}` };
  }
  return { dateISO: '', label: trimmed };
}

function splitAm(am: string): { id: string; name: string } {
  const trimmed = (am || '').trim();
  const idx = trimmed.indexOf('-');
  if (idx > 0) {
    return { id: trimmed.slice(0, idx).trim(), name: trimmed.slice(idx + 1).trim() };
  }
  return { id: '', name: trimmed };
}

function parseCsv<T extends Record<string, string>>(csv: string): T[] {
  if (!csv) return [];
  const result = Papa.parse<T>(csv, { header: true, skipEmptyLines: true, transformHeader: h => h.trim() });
  return result.data;
}

function parseDataRows(csv: string, errors: string[]): DataRow[] {
  const rows = parseCsv<Record<string, string>>(csv);
  const out: DataRow[] = [];
  for (const r of rows) {
    try {
      const date = parseDateString(r['Time'] ?? '');
      if (!date.dateISO) continue;
      const am = splitAm(r['AM'] ?? '');
      out.push({
        capQuanLy: (r['Cấp Quản Lý'] ?? '').trim(),
        buuCuc: (r['Bưu cục'] ?? '').trim(),
        loaiHang: (r['Loại Hàng'] ?? '').trim(),
        date: date.label,
        dateISO: date.dateISO,
        volume: parseNumber(r['Volume']),
        pctGan: parsePercent(r['% Gán']),
        pctGTC: parsePercent(r['% GTC']),
        pctChuyenTra: parsePercent(r['% Chuyển trả']),
        leadtime: parseLeadtime(r['Leadtime']),
        slGTC: parseNumber(r['Sản Lượng Giao Thành Công']),
        slChuyenTra: parseNumber(r['Sản Lượng Chuyển Trả']),
        slGan: parseNumber(r['Sản Lượng Gán']),
        slTra: parseNumber(r['Sản Lượng Trả']),
        slTon: parseNumber(r['Sản Lượng Tồn']),
        slChuaGan: parseNumber(r['Sản Lượng Chưa Gán']),
        pctChuaGan: parsePercent(r['% Chưa Gán']),
        pctTon: parsePercent(r['%Tồn']),
        hangMoiVeTrongNgay: parseNumber(r['Hàng Mới Về Trong Ngày']),
        vung: (r['Vùng'] ?? '').trim(),
        tinh: (r['Tỉnh'] ?? '').trim(),
        am: (r['AM'] ?? '').trim(),
        amId: am.id,
        amName: am.name,
      });
    } catch (e) {
      errors.push(`Data row skipped: ${(e as Error).message}`);
    }
  }
  return out;
}

function parseCoCauRows(csv: string, errors: string[]): CoCauRow[] {
  const rows = parseCsv<Record<string, string>>(csv);
  const out: CoCauRow[] = [];
  for (const r of rows) {
    try {
      const am = splitAm(r['AM'] ?? '');
      out.push({
        stt: (r['STT'] ?? '').trim(),
        buuCucId: (r['ID Bưu Cục'] ?? '').trim(),
        buuCucTen: (r['Tên Bưu Cục'] ?? '').trim(),
        buuCuc: (r['Bưu Cục'] ?? '').trim(),
        am: (r['AM'] ?? '').trim(),
        amId: am.id,
        amName: am.name,
        huyen: (r['Huyện/Tp/Tx'] ?? '').trim(),
        tinh: (r['Tỉnh'] ?? '').trim(),
        trangThai: (r['Trạng thái'] ?? '').trim(),
        lisa: (r['Lisa'] ?? '').trim(),
      });
    } catch (e) {
      errors.push(`Cơ cấu row skipped: ${(e as Error).message}`);
    }
  }
  return out;
}

export function parseSheets(dataCsv: string, coCauCsv: string): SheetSnapshot {
  const errors: string[] = [];
  const data = parseDataRows(dataCsv, errors);
  const coCau = parseCoCauRows(coCauCsv, errors);
  return { data, coCau, fetchedAt: new Date().toISOString(), errors };
}

export function getActiveAmIds(coCau: CoCauRow[]): Set<string> {
  const ids = new Set<string>();
  for (const r of coCau) {
    if (r.amId) ids.add(r.amId);
  }
  return ids;
}

export function getAmIdToName(coCau: CoCauRow[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of coCau) {
    if (r.amId && !m.has(r.amId)) m.set(r.amId, r.amName);
  }
  return m;
}
