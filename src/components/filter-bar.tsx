'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { parseFilters, filtersToSearchParams, type DimensionTree } from '@/lib/filters';
import type { Filters, Granularity } from '@/lib/types';

interface Props {
  tree: DimensionTree;
  defaultRange: { from: string; to: string };
  loaiHangOptions: string[];
}

const ALL = '__all__';

export function FilterBar({ tree, defaultRange, loaiHangOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters: Filters = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const effFrom = filters.from || defaultRange.from;
  const effTo = filters.to || defaultRange.to;

  const update = useCallback(
    (next: Partial<Filters>) => {
      const merged: Filters = { ...filters, ...next };
      const newSp = filtersToSearchParams(merged);
      router.push(`${pathname}?${newSp.toString()}`);
    },
    [filters, pathname, router]
  );

  const tinhOptions = useMemo(() => {
    if (!filters.vung.length) {
      const s = new Set<string>();
      for (const arr of tree.tinhByVung.values()) arr.forEach(x => s.add(x));
      return [...s].sort();
    }
    return [...new Set(filters.vung.flatMap(v => tree.tinhByVung.get(v) ?? []))].sort();
  }, [filters.vung, tree]);

  const amOptions = useMemo(() => {
    const src = tinhOptions.filter(t => !filters.tinh.length || filters.tinh.includes(t));
    const m = new Map<string, string>();
    for (const t of src) for (const a of tree.amByTinh.get(t) ?? []) m.set(a.id, a.name);
    return [...m.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [tinhOptions, filters.tinh, tree]);

  const bcOptions = useMemo(() => {
    const ids = filters.am.length ? filters.am : amOptions.map(a => a.id);
    const s = new Set<string>();
    for (const id of ids) for (const bc of tree.buuCucByAm.get(id) ?? []) s.add(bc);
    return [...s].sort();
  }, [filters.am, amOptions, tree]);

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-12">
      <Field label="Vùng" span="md:col-span-1">
        <Single value={filters.vung[0] ?? ALL} onValueChange={v => update({ vung: v === ALL ? [] : [v], tinh: [], am: [], buuCuc: [] })} options={tree.vungs} placeholder="Tất cả" />
      </Field>
      <Field label="Tỉnh" span="md:col-span-2">
        <Single value={filters.tinh[0] ?? ALL} onValueChange={v => update({ tinh: v === ALL ? [] : [v], am: [], buuCuc: [] })} options={tinhOptions} placeholder="Tất cả" />
      </Field>
      <Field label="AM" span="md:col-span-3">
        <Single
          value={filters.am[0] ?? ALL}
          onValueChange={v => update({ am: v === ALL ? [] : [v], buuCuc: [] })}
          options={amOptions.map(a => ({ value: a.id, label: a.name }))}
          placeholder="Tất cả"
        />
      </Field>
      <Field label="Bưu cục" span="md:col-span-3">
        <Single value={filters.buuCuc[0] ?? ALL} onValueChange={v => update({ buuCuc: v === ALL ? [] : [v] })} options={bcOptions} placeholder="Tất cả" />
      </Field>
      <Field label="Từ" span="md:col-span-1">
        <Input type="date" value={effFrom} onChange={e => update({ from: e.target.value })} />
      </Field>
      <Field label="Đến" span="md:col-span-1">
        <Input type="date" value={effTo} onChange={e => update({ to: e.target.value })} />
      </Field>
      <Field label="Chu kỳ" span="md:col-span-1">
        <Select value={filters.granularity} onValueChange={v => update({ granularity: v as Granularity })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Ngày</SelectItem>
            <SelectItem value="week">Tuần</SelectItem>
            <SelectItem value="month">Tháng</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="md:col-span-12 flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium">Loại hàng:</span>
        {loaiHangOptions.map(lh => {
          const checked = filters.loaiHang.length === 0 || filters.loaiHang.includes(lh);
          return (
            <label key={lh} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={checked}
                onCheckedChange={c => {
                  const curr = filters.loaiHang.length === 0 ? [...loaiHangOptions] : [...filters.loaiHang];
                  const next = c ? [...new Set([...curr, lh])] : curr.filter(x => x !== lh);
                  update({ loaiHang: next.length === loaiHangOptions.length ? [] : next });
                }}
              />
              <span>{lh}</span>
            </label>
          );
        })}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => router.push(pathname)}>
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}

function Field({ label, span, children }: { label: string; span: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1 ${span}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

interface OptObj { value: string; label: string }
function Single({
  value,
  onValueChange,
  options,
  placeholder,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: string[] | OptObj[];
  placeholder: string;
}) {
  const opts: OptObj[] = (options as Array<string | OptObj>).map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{placeholder}</SelectItem>
        {opts.map(o => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
