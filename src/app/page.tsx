import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSnapshot } from '@/lib/sheets-fetcher';
import { parseFilters, applyFilters, buildDimensionTree, defaultDateRange } from '@/lib/filters';
import { aggregateByTime, aggregateOverall, aggregateRanking, aggregateByLoaiHang } from '@/lib/aggregations';
import { getEnvThresholds } from '@/lib/alerts';
import { FilterBar } from '@/components/filter-bar';
import { KpiCards } from '@/components/kpi-cards';
import { TrendChart } from '@/components/trend-chart';
import { RankingTable } from '@/components/ranking-table';
import { AlertsClient } from '@/components/alerts-client';
import { LoaiHangComparison } from '@/components/loai-hang-comparison';
import { HeatmapWrapper } from '@/components/heatmap-wrapper';
import { RefreshButton } from '@/components/refresh-button';
import { ThresholdSettings } from '@/components/threshold-settings';
import { LogoutButton } from '@/components/logout-button';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const snapshot = await getSnapshot();
  const { data, coCau, fetchedAt, errors } = snapshot;

  if (data.length === 0) {
    return <ErrorScreen errors={errors} fetchedAt={fetchedAt} amName={session.amName} />;
  }

  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === 'string') sp.set(k, v);
    else if (Array.isArray(v)) sp.set(k, v.join(','));
  }
  const filters = parseFilters(sp);
  const range = defaultDateRange(data);
  const effFilters = {
    ...filters,
    from: filters.from || range.from,
    to: filters.to || range.to,
  };

  const filtered = applyFilters(data, effFilters);
  const tree = buildDimensionTree(data);

  const periodDays = diffDays(effFilters.from!, effFilters.to!);
  const prevTo = shiftIso(effFilters.from!, -1);
  const prevFrom = shiftIso(prevTo, -periodDays);
  const prevFiltered = applyFilters(data, { ...effFilters, from: prevFrom, to: prevTo });

  const trend = aggregateByTime(filtered, effFilters.granularity);
  const overall = aggregateOverall(filtered);
  const previousOverall = aggregateOverall(prevFiltered);
  const rankingAm = aggregateRanking(filtered, 'am');
  const rankingBc = aggregateRanking(filtered, 'buuCuc');
  const loaiHangData = aggregateByLoaiHang(filtered);
  const loaiHangOptions = [...new Set(data.map(d => d.loaiHang))].sort();
  const defaultThresholds = getEnvThresholds();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Anti Dashboard</span>
            <span className="text-sm text-muted-foreground">— GHN DNB</span>
            <span className="text-xs text-muted-foreground hidden md:inline">({coCau.length} BC, {filtered.length}/{data.length} rows)</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton fetchedAt={fetchedAt} />
            <ThresholdSettings defaults={defaultThresholds} />
            <LogoutButton amName={session.amName} />
          </div>
        </div>
      </header>

      <main className="container py-4 space-y-4">
        {errors.length > 0 && (
          <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-sm">
            <strong>Cảnh báo dữ liệu:</strong> {errors.slice(0, 3).join(' · ')}
            {errors.length > 3 && ` (+${errors.length - 3} lỗi khác)`}
          </div>
        )}
        <FilterBar tree={tree} defaultRange={range} loaiHangOptions={loaiHangOptions} />
        <KpiCards current={overall} previous={previousOverall} />
        <TrendChart data={trend} />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><RankingTable amRows={rankingAm} bcRows={rankingBc} /></div>
          <AlertsClient rows={filtered} defaultThresholds={defaultThresholds} />
        </div>
        <LoaiHangComparison data={loaiHangData} />
        <HeatmapWrapper rows={filtered} />
        <footer className="text-center text-xs text-muted-foreground py-6">
          Anti Dashboard GHN-DNB · Cache 60s · {data.length.toLocaleString('vi-VN')} bản ghi
        </footer>
      </main>
    </div>
  );
}

function ErrorScreen({ errors, fetchedAt, amName }: { errors: string[]; fetchedAt: string; amName: string }) {
  return (
    <div className="container py-12">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Anti Dashboard — GHN DNB</h1>
        <LogoutButton amName={amName} />
      </header>
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <h2 className="font-semibold text-destructive">Không tải được dữ liệu</h2>
        <p className="text-sm text-muted-foreground mt-1">Fetched at: {fetchedAt}</p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
        <RefreshButton fetchedAt={fetchedAt} />
      </div>
    </div>
  );
}

function diffDays(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
