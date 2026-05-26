export type LoaiHang = 'Hàng Mới Ca 1' | 'Hàng Mới Ca 2' | 'Hàng Tồn';

export interface DataRow {
  capQuanLy: string;
  buuCuc: string;
  loaiHang: LoaiHang | string;
  date: string;
  dateISO: string;
  volume: number;
  pctGan: number;
  pctGTC: number;
  pctChuyenTra: number;
  leadtime: number | null;
  slGTC: number;
  slChuyenTra: number;
  slGan: number;
  slTra: number;
  slTon: number;
  slChuaGan: number;
  pctChuaGan: number;
  pctTon: number;
  hangMoiVeTrongNgay: number;
  vung: string;
  tinh: string;
  am: string;
  amId: string;
  amName: string;
}

export interface CoCauRow {
  stt: string;
  buuCucId: string;
  buuCucTen: string;
  buuCuc: string;
  am: string;
  amId: string;
  amName: string;
  huyen: string;
  tinh: string;
  trangThai: string;
  lisa: string;
}

export interface SheetSnapshot {
  data: DataRow[];
  coCau: CoCauRow[];
  fetchedAt: string;
  errors: string[];
}

export type Granularity = 'day' | 'week' | 'month';

export interface Filters {
  vung: string[];
  tinh: string[];
  am: string[];
  buuCuc: string[];
  from: string | null;
  to: string | null;
  granularity: Granularity;
  loaiHang: string[];
}

export interface AggregatedBucket {
  key: string;
  label: string;
  volume: number;
  pctGTC: number;
  pctGan: number;
  pctChuyenTra: number;
  pctTon: number;
  pctChuaGan: number;
  leadtime: number | null;
}

export interface RankingRow {
  groupKey: string;
  groupLabel: string;
  volume: number;
  pctGTC: number;
  pctTon: number;
  pctChuaGan: number;
  leadtime: number | null;
  buuCucCount: number;
}

export type AlertSeverity = 'critical' | 'warning';

export interface AlertItem {
  buuCuc: string;
  am: string;
  date: string;
  metric: 'pctTon' | 'pctChuaGan' | 'leadtime' | 'pctGTC';
  metricLabel: string;
  value: number;
  threshold: number;
  severity: AlertSeverity;
}

export interface Thresholds {
  pctTon: number;
  pctChuaGan: number;
  leadtime: number;
  pctGTC: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  pctTon: 0.4,
  pctChuaGan: 0.3,
  leadtime: 25,
  pctGTC: 0.6,
};
