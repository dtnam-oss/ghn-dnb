import { parseSheets } from './sheets-parser';
import type { SheetSnapshot } from './types';

const TTL_MS = 60_000;

interface CacheEntry {
  snapshot: SheetSnapshot;
  expiresAt: number;
}

const cacheKey = 'snapshot';
const memCache = new Map<string, CacheEntry>();
let inflight: Promise<SheetSnapshot> | null = null;

function gvizUrl(sheetName: string): string {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error('SHEET_ID env var not set');
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

async function fetchCsv(sheetName: string): Promise<string> {
  const res = await fetch(gvizUrl(sheetName), {
    cache: 'no-store',
    headers: { 'User-Agent': 'GHN-DNB-Dashboard/1.0' },
  });
  if (!res.ok) throw new Error(`Failed fetch sheet "${sheetName}": ${res.status} ${res.statusText}`);
  return res.text();
}

async function loadSnapshot(): Promise<SheetSnapshot> {
  const errors: string[] = [];
  const [dataCsv, coCauCsv] = await Promise.all([
    fetchCsv('Data').catch(e => {
      errors.push(`Data sheet fetch: ${(e as Error).message}`);
      return '';
    }),
    fetchCsv('Cơ cấu').catch(e => {
      errors.push(`Cơ cấu sheet fetch: ${(e as Error).message}`);
      return '';
    }),
  ]);
  const parsed = parseSheets(dataCsv, coCauCsv);
  return { ...parsed, errors: [...errors, ...parsed.errors], fetchedAt: new Date().toISOString() };
}

export async function getSnapshot(): Promise<SheetSnapshot> {
  const entry = memCache.get(cacheKey);
  if (entry && entry.expiresAt > Date.now()) return entry.snapshot;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const snapshot = await loadSnapshot();
      memCache.set(cacheKey, { snapshot, expiresAt: Date.now() + TTL_MS });
      return snapshot;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function refreshSnapshot(): void {
  memCache.delete(cacheKey);
}
