import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtHours, fmtPercent } from '@/lib/format';
import type { AlertItem } from '@/lib/types';

interface Props {
  alerts: AlertItem[];
  total: number;
}

export function AlertsPanel({ alerts, total }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Cảnh báo ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[420px] overflow-y-auto p-0">
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Không có cảnh báo</div>
        ) : (
          <ul className="divide-y">
            {alerts.slice(0, 50).map((a, i) => (
              <li key={i} className="flex items-start gap-2 px-4 py-2">
                <Icon severity={a.severity} />
                <div className="flex-1 text-sm">
                  <div className="font-medium leading-tight">{a.buuCuc}</div>
                  <div className="text-xs text-muted-foreground">{a.am} · {a.date}</div>
                  <div className="text-xs">
                    {a.metricLabel}: <span className={a.severity === 'critical' ? 'text-destructive font-semibold' : 'text-warning font-semibold'}>{fmt(a)}</span>
                    <span className="text-muted-foreground"> (ngưỡng {fmtThr(a)})</span>
                  </div>
                </div>
              </li>
            ))}
            {alerts.length > 50 && (
              <li className="px-4 py-2 text-xs text-muted-foreground text-center">+ {alerts.length - 50} mục khác</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Icon({ severity }: { severity: AlertItem['severity'] }) {
  if (severity === 'critical') return <AlertCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />;
  return <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />;
}

function fmt(a: AlertItem): string {
  if (a.metric === 'leadtime') return fmtHours(a.value);
  return fmtPercent(a.value);
}
function fmtThr(a: AlertItem): string {
  if (a.metric === 'leadtime') return fmtHours(a.threshold);
  return fmtPercent(a.threshold);
}
