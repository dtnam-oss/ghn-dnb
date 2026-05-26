'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fmtPercent } from '@/lib/format';
import type { HeatmapCell } from '@/lib/aggregations';

interface Props {
  cells: HeatmapCell[];
  metric: 'pctTon' | 'pctGTC';
  onMetricChange: (m: 'pctTon' | 'pctGTC') => void;
}

export function Heatmap({ cells, metric, onMetricChange }: Props) {
  const { rows, dates, byKey, volByGroup } = useMemo(() => {
    const dateSet = new Set<string>();
    const groupVol = new Map<string, number>();
    const byKey = new Map<string, HeatmapCell>();
    for (const c of cells) {
      dateSet.add(c.dateISO);
      groupVol.set(c.groupKey, (groupVol.get(c.groupKey) || 0) + c.volume);
      byKey.set(`${c.groupKey}|${c.dateISO}`, c);
    }
    const dates = [...dateSet].sort();
    const groups = [...groupVol.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k]) => k);
    return { rows: groups, dates, byKey, volByGroup: groupVol };
  }, [cells]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Heatmap Bưu cục × Ngày (top 20 Volume)</CardTitle>
        <Select value={metric} onValueChange={v => onMetricChange(v as 'pctTon' | 'pctGTC')}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pctTon">% Tồn (đỏ = cao)</SelectItem>
            <SelectItem value="pctGTC">% GTC (xanh = cao)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Không có dữ liệu</div>
        ) : (
          <table className="text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card px-2 py-1 text-left font-medium">Bưu cục</th>
                {dates.map(d => (
                  <th key={d} className="px-1 py-1 text-center font-medium whitespace-nowrap" title={d}>
                    {d.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(g => (
                <tr key={g}>
                  <td className="sticky left-0 bg-card px-2 py-1 max-w-[240px] truncate" title={g}>{g}</td>
                  {dates.map(d => {
                    const c = byKey.get(`${g}|${d}`);
                    if (!c || c.volume === 0) return <td key={d} className="px-1 py-1 text-center text-muted-foreground/50">–</td>;
                    const color = scaleColor(c.value, metric);
                    return (
                      <td
                        key={d}
                        className="px-1 py-1 text-center text-[10px] tabular-nums"
                        style={{ background: color, color: contrast(c.value, metric) }}
                        title={`${g}\n${d}\n${fmtPercent(c.value)} (vol ${c.volume})`}
                      >
                        {Math.round(c.value * 100)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-2 text-xs text-muted-foreground">Tổng {rows.length} BC, {dates.length} ngày. Vol tổng: {sum(volByGroup).toLocaleString('vi-VN')}.</div>
      </CardContent>
    </Card>
  );
}

function scaleColor(v: number, metric: 'pctTon' | 'pctGTC'): string {
  const x = Math.max(0, Math.min(1, v));
  if (metric === 'pctTon') {
    const lightness = 95 - x * 55;
    return `hsl(0, 80%, ${lightness}%)`;
  }
  const lightness = 95 - x * 50;
  return `hsl(140, 60%, ${lightness}%)`;
}

function contrast(v: number, metric: 'pctTon' | 'pctGTC'): string {
  const x = Math.max(0, Math.min(1, v));
  const threshold = metric === 'pctTon' ? 0.45 : 0.55;
  return x > threshold ? '#fff' : 'hsl(222, 47%, 11%)';
}

function sum(m: Map<string, number>): number {
  let s = 0;
  for (const v of m.values()) s += v;
  return s;
}
