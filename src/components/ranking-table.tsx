'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fmtHours, fmtNumber, fmtPercent } from '@/lib/format';
import type { RankingRow } from '@/lib/types';

interface Props {
  amRows: RankingRow[];
  bcRows: RankingRow[];
}

export function RankingTable({ amRows, bcRows }: Props) {
  const [tab, setTab] = useState<'am' | 'buuCuc'>('am');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'pctTon', desc: true }]);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const drill = (row: RankingRow) => {
    const next = new URLSearchParams(sp.toString());
    if (tab === 'am') next.set('am', row.groupKey);
    else next.set('bc', row.groupKey);
    router.push(`${pathname}?${next.toString()}`);
  };

  const columns: ColumnDef<RankingRow>[] = useMemo(
    () => [
      {
        accessorKey: 'groupLabel',
        header: tab === 'am' ? 'AM' : 'Bưu cục',
        cell: ({ row }) => (
          <button onClick={() => drill(row.original)} className="text-left hover:underline">
            {row.original.groupLabel}
          </button>
        ),
      },
      { accessorKey: 'volume', header: sortHeader('Volume'), cell: ({ getValue }) => fmtNumber(getValue<number>()), sortingFn: 'basic' },
      { accessorKey: 'pctGTC', header: sortHeader('% GTC'), cell: ({ getValue }) => fmtPercent(getValue<number>()), sortingFn: 'basic' },
      { accessorKey: 'pctTon', header: sortHeader('% Tồn'), cell: ({ getValue }) => fmtPercent(getValue<number>()), sortingFn: 'basic' },
      { accessorKey: 'pctChuaGan', header: sortHeader('% Chưa Gán'), cell: ({ getValue }) => fmtPercent(getValue<number>()), sortingFn: 'basic' },
      {
        accessorKey: 'leadtime',
        header: sortHeader('Leadtime'),
        cell: ({ getValue }) => fmtHours(getValue<number | null>()),
        sortingFn: (a, b, id) => (a.getValue<number | null>(id) ?? 0) - (b.getValue<number | null>(id) ?? 0),
      },
      { accessorKey: 'buuCucCount', header: '# BC', cell: ({ getValue }) => getValue<number>() || '–' },
    ],
    [tab, sp]
  );

  const data = tab === 'am' ? amRows : bcRows;
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Bảng xếp hạng</CardTitle>
        <Tabs value={tab} onValueChange={v => setTab(v as 'am' | 'buuCuc')}>
          <TabsList>
            <TabsTrigger value="am">Theo AM</TabsTrigger>
            <TabsTrigger value="buuCuc">Theo Bưu cục</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} className="px-3 py-2 text-left font-medium">
                      {h.isPlaceholder ? null : (
                        <button onClick={h.column.getToggleSortingHandler()} className="flex items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                  {r.getVisibleCells().map(c => (
                    <td key={c.id} className="px-3 py-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function sortHeader(label: string) {
  // eslint-disable-next-line react/display-name
  return () => (
    <span className="inline-flex items-center gap-1">
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-60" />
    </span>
  );
}
