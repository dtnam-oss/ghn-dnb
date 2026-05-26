'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fmtHours, fmtNumber, fmtPercent } from '@/lib/format';
import type { AggregatedBucket } from '@/lib/types';

type Metric = 'volume' | 'pctGTC' | 'pctTon' | 'pctChuaGan' | 'leadtime';

const METRICS: { key: Metric; label: string; isPct: boolean; isHours: boolean }[] = [
  { key: 'volume', label: 'Volume', isPct: false, isHours: false },
  { key: 'pctGTC', label: '% GTC', isPct: true, isHours: false },
  { key: 'pctTon', label: '% Tồn', isPct: true, isHours: false },
  { key: 'pctChuaGan', label: '% Chưa Gán', isPct: true, isHours: false },
  { key: 'leadtime', label: 'Leadtime (h)', isPct: false, isHours: true },
];

interface Props {
  data: { loaiHang: string; bucket: AggregatedBucket }[];
}

export function LoaiHangComparison({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('volume');
  const m = METRICS.find(x => x.key === metric)!;
  const chartData = data.map(d => ({ name: d.loaiHang, value: d.bucket[metric] ?? 0 }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>So sánh theo Loại Hàng</CardTitle>
        <Select value={metric} onValueChange={v => setMetric(v as Metric)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {METRICS.map(opt => <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={v => (m.isPct ? fmtPercent(v, 0) : m.isHours ? fmtHours(v, 0) : fmtNumber(v))}
              width={70}
            />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              formatter={(value: number) => [m.isPct ? fmtPercent(value) : m.isHours ? fmtHours(value) : fmtNumber(value), m.label]}
            />
            <Legend />
            <Bar dataKey="value" name={m.label} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
