import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtDelta, fmtHours, fmtNumber, fmtPercent } from '@/lib/format';
import type { AggregatedBucket } from '@/lib/types';

interface Props {
  current: AggregatedBucket;
  previous: AggregatedBucket;
}

export function KpiCards({ current, previous }: Props) {
  const items = [
    {
      label: 'Tổng Volume',
      value: fmtNumber(current.volume),
      delta: fmtDelta(current.volume, previous.volume, 'number'),
      directionGood: 'up',
    },
    {
      label: 'Avg % GTC',
      value: fmtPercent(current.pctGTC),
      delta: fmtDelta(current.pctGTC, previous.pctGTC, 'percent'),
      directionGood: 'up',
    },
    {
      label: 'Avg Leadtime',
      value: fmtHours(current.leadtime),
      delta:
        current.leadtime != null && previous.leadtime != null
          ? fmtDelta(current.leadtime, previous.leadtime, 'hours')
          : { text: '–', positive: false },
      directionGood: 'down',
    },
    {
      label: 'Avg % Tồn',
      value: fmtPercent(current.pctTon),
      delta: fmtDelta(current.pctTon, previous.pctTon, 'percent'),
      directionGood: 'down',
    },
    {
      label: 'Avg % Chưa Gán',
      value: fmtPercent(current.pctChuaGan),
      delta: fmtDelta(current.pctChuaGan, previous.pctChuaGan, 'percent'),
      directionGood: 'down',
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {items.map(item => {
        const isUp = item.delta.positive;
        const good = (item.directionGood === 'up' && isUp) || (item.directionGood === 'down' && !isUp);
        return (
          <Card key={item.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className={`text-xs mt-1 ${good ? 'text-success' : 'text-destructive'}`}>{item.delta.text}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
