'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton({ amName }: { amName: string }) {
  const router = useRouter();
  const onClick = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  };
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden md:inline">{amName}</span>
      <Button variant="ghost" size="sm" onClick={onClick}>
        <LogOut className="h-3.5 w-3.5" />
        Đăng xuất
      </Button>
    </div>
  );
}
