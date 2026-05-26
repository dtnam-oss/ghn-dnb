'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RefreshButton({ fetchedAt }: { fetchedAt: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastClicked, setLastClicked] = useState(0);

  const onClick = async () => {
    setLastClicked(Date.now());
    await fetch('/api/refresh', { method: 'POST' });
    startTransition(() => router.refresh());
  };

  const time = fetchedAt ? new Date(fetchedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Cập nhật: {time}</span>
      <Button size="sm" variant="outline" onClick={onClick} disabled={isPending}>
        <RotateCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
        Làm mới
      </Button>
    </div>
  );
}
