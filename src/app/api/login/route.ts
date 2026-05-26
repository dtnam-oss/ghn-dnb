import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/sheets-fetcher';
import { getActiveAmIds, getAmIdToName } from '@/lib/sheets-parser';
import { COOKIE_NAME, createSessionToken, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: Request) {
  let body: { amId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ' }, { status: 400 });
  }
  const amId = (body.amId || '').trim();
  if (!amId) {
    return NextResponse.json({ error: 'Thiếu mã nhân viên' }, { status: 400 });
  }
  const snapshot = await getSnapshot();
  const valid = getActiveAmIds(snapshot.coCau);
  if (!valid.has(amId)) {
    return NextResponse.json({ error: 'Mã nhân viên không hợp lệ' }, { status: 401 });
  }
  const amName = getAmIdToName(snapshot.coCau).get(amId) ?? '';
  const token = await createSessionToken({ amId, amName });
  const res = NextResponse.json({ ok: true, amId, amName });
  res.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
  return res;
}
