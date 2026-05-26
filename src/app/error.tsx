'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="container py-12">
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive">Đã có lỗi xảy ra</h2>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        {error.digest && <p className="text-xs text-muted-foreground mt-1">Digest: {error.digest}</p>}
        <Button className="mt-4" onClick={reset}>Thử lại</Button>
      </div>
    </div>
  );
}
