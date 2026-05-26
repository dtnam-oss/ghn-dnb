'use client';

import { useMemo, useState } from 'react';
import { Heatmap } from './heatmap';
import { buildHeatmap, type HeatmapCell } from '@/lib/aggregations';
import type { DataRow } from '@/lib/types';

export function HeatmapWrapper({ rows }: { rows: DataRow[] }) {
  const [metric, setMetric] = useState<'pctTon' | 'pctGTC'>('pctTon');
  const cells: HeatmapCell[] = useMemo(() => buildHeatmap(rows, metric), [rows, metric]);
  return <Heatmap cells={cells} metric={metric} onMetricChange={setMetric} />;
}
