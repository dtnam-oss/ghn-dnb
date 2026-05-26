const nf = new Intl.NumberFormat('vi-VN');
const pf = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtNumber(n: number): string {
  return nf.format(Math.round(n));
}

export function fmtPercent(n: number, digits = 2): string {
  if (!isFinite(n)) return '–';
  return `${(n * 100).toFixed(digits).replace('.', ',')}%`;
}

export function fmtHours(n: number | null, digits = 1): string {
  if (n == null || !isFinite(n)) return '–';
  return `${pf.format(n).replace(/,(\d{3})/g, '$1')}h`.replace(/(\.\d+)0+h$/, '$1h');
}

export function fmtDelta(curr: number, prev: number, kind: 'percent' | 'number' | 'hours' = 'percent'): {
  text: string;
  positive: boolean;
} {
  if (!isFinite(prev) || prev === 0) return { text: '–', positive: false };
  const diff = curr - prev;
  const rel = diff / Math.abs(prev);
  const positive = diff >= 0;
  if (kind === 'percent') {
    return { text: `${positive ? '↑' : '↓'} ${(Math.abs(diff) * 100).toFixed(2).replace('.', ',')}đ`, positive };
  }
  if (kind === 'hours') {
    return { text: `${positive ? '↑' : '↓'} ${Math.abs(diff).toFixed(1).replace('.', ',')}h`, positive };
  }
  return { text: `${positive ? '↑' : '↓'} ${(Math.abs(rel) * 100).toFixed(1).replace('.', ',')}%`, positive };
}
