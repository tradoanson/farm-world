import { NextResponse } from 'next/server';
/** Disabled until server-authoritative commands and verified identity provider exist.
 * Client-submitted farm snapshots must never become authoritative online economy.
 */
export const runtime = 'nodejs';
export async function POST() {
  return NextResponse.json({ error: 'ONLINE_MUTATIONS_NOT_ENABLED' }, { status: 501, headers: { 'Cache-Control': 'no-store' } });
}
