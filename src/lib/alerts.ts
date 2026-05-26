import type { AlertItem, DataRow, Thresholds } from './types';
import { DEFAULT_THRESHOLDS } from './types';

export function getEnvThresholds(): Thresholds {
  return {
    pctTon: Number(process.env.ALERT_TON_THRESHOLD) || DEFAULT_THRESHOLDS.pctTon,
    pctChuaGan: Number(process.env.ALERT_CHUA_GAN_THRESHOLD) || DEFAULT_THRESHOLDS.pctChuaGan,
    leadtime: Number(process.env.ALERT_LEADTIME_THRESHOLD) || DEFAULT_THRESHOLDS.leadtime,
    pctGTC: Number(process.env.ALERT_GTC_THRESHOLD) || DEFAULT_THRESHOLDS.pctGTC,
  };
}

export function detectAlerts(rows: DataRow[], thresholds: Thresholds): AlertItem[] {
  const out: AlertItem[] = [];
  for (const r of rows) {
    if (r.volume === 0) continue;
    if (r.pctTon > thresholds.pctTon) {
      out.push(mk(r, 'pctTon', '% Tồn', r.pctTon, thresholds.pctTon, 'warning'));
    }
    if (r.pctChuaGan > thresholds.pctChuaGan) {
      out.push(mk(r, 'pctChuaGan', '% Chưa Gán', r.pctChuaGan, thresholds.pctChuaGan, 'warning'));
    }
    if (r.leadtime != null && r.leadtime > thresholds.leadtime) {
      out.push(mk(r, 'leadtime', 'Leadtime (h)', r.leadtime, thresholds.leadtime, 'warning'));
    }
    if (r.pctGTC < thresholds.pctGTC) {
      out.push(mk(r, 'pctGTC', '% GTC', r.pctGTC, thresholds.pctGTC, 'critical'));
    }
  }
  return out.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
    return Math.abs(b.value - b.threshold) - Math.abs(a.value - a.threshold);
  });
}

function mk(
  r: DataRow,
  metric: AlertItem['metric'],
  metricLabel: string,
  value: number,
  threshold: number,
  severity: AlertItem['severity']
): AlertItem {
  return {
    buuCuc: r.buuCuc,
    am: r.amName || r.am,
    date: r.date,
    metric,
    metricLabel,
    value,
    threshold,
    severity,
  };
}
