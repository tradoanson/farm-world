import { NextRequest, NextResponse } from 'next/server';
import { applyOwnedSnapshot, principalFromAuthorization } from '../../../../../../lib/server/farm-store';
export const runtime = 'nodejs';
export async function POST(req: NextRequest, context: { params: Promise<{ farmId: string }> }) {
  const principal = principalFromAuthorization(req.headers.get('authorization'));
  if (!principal) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { farmId } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(farmId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 });
  const raw = await req.text();
  if (raw.length > 100_000) return NextResponse.json({ error: 'TOO_LARGE' }, { status: 413 });
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    if (!body || typeof body !== 'object' || !body.command || typeof body.command !== 'object' || (body.command as Record<string,unknown>).farmId !== farmId) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    const result = await applyOwnedSnapshot(principal, body);
    return NextResponse.json('result' in result ? result.result : { error: result.error }, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'INVALID_REQUEST_OR_UNAVAILABLE' }, { status: 400 }); }
}
