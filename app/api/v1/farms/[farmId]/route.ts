import { NextRequest, NextResponse } from 'next/server';
import { principalFromAuthorization, readOwnedFarm } from '../../../../../lib/server/farm-store';
export const runtime = 'nodejs';
export async function GET(req: NextRequest, context: { params: Promise<{ farmId: string }> }) {
  const principal = principalFromAuthorization(req.headers.get('authorization'));
  if (!principal) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const { farmId } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(farmId)) return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 });
  try {
    const state = await readOwnedFarm(principal, farmId);
    return state ? NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  } catch { return NextResponse.json({ error: 'SERVICE_UNAVAILABLE' }, { status: 503 }); }
}
