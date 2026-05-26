import { NextResponse } from 'next/server';
import { refreshSnapshot } from '@/lib/sheets-fetcher';

export async function POST() {
  refreshSnapshot();
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}
