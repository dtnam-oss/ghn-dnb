'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fmtHours, fmtNumber, fmtPercent } from '@/lib/format';
import type { AggregatedBucket } from '@/lib/types';

type MetricKey = 'volume' | 'pctGTC' | 'pctTon' | 'pctChuaGan' | 'leadtime';

const METRICS: { key: MetricKey; label: string; color: string; isPercent: boolean; isHours: boolean }[] = [
  { key: 'pctGTC', label: '% GTC', color: '#16a34a', isPercent: true, isHours: false },
  { key: 'pctTon', label: '% Tồn', color: '#f97316', isPercent: true, isHours: false },
  { key: 'pctChuaGan', label: '% Chưa Gán', color: '#ef4444', isPercent: true, isHours: false },
  { key: 'leadtime', label: 'Leadtime (h)', color: '#0ea5e9', isPercent: false, isHours: true },
  { key: 'volume', label: 'Volume', color: '#6366f1', isPercent: false, isHours: false },
];

export function TrendChart({ data }: { data: AggregatedBucket[] }) {
  const [metric, setMetric] = useState<MetricKey>('pctGTC');
  const m = METRICS.find(x => x.key === metric)!;

  const chartData = data.map(d => ({
    label: d.label,
    value: d[metric] ?? null,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Xu hướng theo thời gian</CardTitle>
        <Select value={metric} onValueChange={v => setMetric(v as MetricKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRICS.map(opt => (
              <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={v => (m.isPercent ? fmtPercent(v, 0) : m.isHours ? fmtHours(v, 0) : fmtNumber(v))}
              width={70}
            />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              formatter={(value: number) => [
                m.isPercent ? fmtPercent(value) : m.isHours ? fmtHours(value) : fmtNumber(value),
                m.label,
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
