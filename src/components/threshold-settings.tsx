'use client';

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_THRESHOLDS, type Thresholds } from '@/lib/types';

const KEY = 'ghn-dnb-thresholds';

export function loadThresholds(serverThresholds: Thresholds): Thresholds {
  if (typeof window === 'undefined') return serverThresholds;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return serverThresholds;
    const parsed = JSON.parse(raw) as Partial<Thresholds>;
    return {
      pctTon: typeof parsed.pctTon === 'number' ? parsed.pctTon : serverThresholds.pctTon,
      pctChuaGan: typeof parsed.pctChuaGan === 'number' ? parsed.pctChuaGan : serverThresholds.pctChuaGan,
      leadtime: typeof parsed.leadtime === 'number' ? parsed.leadtime : serverThresholds.leadtime,
      pctGTC: typeof parsed.pctGTC === 'number' ? parsed.pctGTC : serverThresholds.pctGTC,
    };
  } catch {
    return serverThresholds;
  }
}

export function ThresholdSettings({ defaults }: { defaults: Thresholds }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Thresholds>(defaults);

  useEffect(() => {
    setValues(loadThresholds(defaults));
  }, [defaults]);

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(values));
    setOpen(false);
    window.dispatchEvent(new CustomEvent('thresholds-changed'));
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setValues(DEFAULT_THRESHOLDS);
    window.dispatchEvent(new CustomEvent('thresholds-changed'));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Settings2 className="h-3.5 w-3.5" />Ngưỡng cảnh báo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấu hình ngưỡng cảnh báo</DialogTitle>
          <DialogDescription>Lưu local (trình duyệt này). Phần trăm nhập dạng 0-100. Leadtime đơn vị giờ.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Row label="% Tồn cảnh báo khi >" pct value={values.pctTon} onChange={v => setValues({ ...values, pctTon: v })} />
          <Row label="% Chưa Gán cảnh báo khi >" pct value={values.pctChuaGan} onChange={v => setValues({ ...values, pctChuaGan: v })} />
          <Row label="Leadtime cảnh báo khi >" value={values.leadtime} onChange={v => setValues({ ...values, leadtime: v })} />
          <Row label="% GTC cảnh báo khi <" pct value={values.pctGTC} onChange={v => setValues({ ...values, pctGTC: v })} />
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={reset}>Khôi phục mặc định</Button>
          <Button onClick={save}>Lưu</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, onChange, pct }: { label: string; value: number; onChange: (n: number) => void; pct?: boolean }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <Label className="col-span-2 text-sm">{label}</Label>
      <Input
        type="number"
        step={pct ? 1 : 0.5}
        value={pct ? Math.round(value * 100) : value}
        onChange={e => {
          const n = Number(e.target.value);
          onChange(pct ? n / 100 : n);
        }}
      />
    </div>
  );
}
