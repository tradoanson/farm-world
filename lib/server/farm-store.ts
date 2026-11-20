import postgres from 'postgres';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { isValidFarm } from '../farm-demo';
import { validProgression } from '../farm-progression';
import { authorizeFarm, isValidCommand, type Principal } from '../farm-authorization';

let sqlClient: ReturnType<typeof postgres> | undefined;
function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_NOT_CONFIGURED');
  return sqlClient ??= postgres(process.env.DATABASE_URL, { max: 5, prepare: false, idle_timeout: 20 });
}
function decodeSession(raw: string | undefined): Principal | null {
  const key = process.env.FARM_SESSION_SECRET;
  if (!raw || !key || key.length < 32) return null;
  const parts = raw.split('.');
  if (parts.length !== 2 || !/^[a-zA-Z0-9_-]+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
  const expected = createHmac('sha256', key).update(parts[0]).digest();
  const provided = Buffer.from(parts[1], 'hex');
  if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[0], 'base64url').toString()) as Principal;
    if (!p || typeof p.userId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.userId) || typeof p.sessionId !== 'string' || !Number.isSafeInteger(p.expiresAt)) return null;
    return p;
  } catch { return null; }
}
/** Sessions are minted ONLY by a future trusted identity backend; this API cannot register/login. */
export function principalFromAuthorization(header: string | null): Principal | null {
  if (!header?.startsWith('Bearer ')) return null;
  const p = decodeSession(header.slice(7));
  return p && p.expiresAt > Date.now() ? p : null;
}
export async function readOwnedFarm(principal: Principal, farmId: string) {
  const sql = db();
  const rows = await sql`SELECT id, owner_id, farm_json, progression_json, revision FROM farm_states WHERE id = ${farmId} AND owner_id = ${principal.userId} LIMIT 1`;
  if (!rows.length) return null;
  const record = rows[0];
  if (!authorizeFarm(principal, { id: String(record.id), ownerId: String(record.owner_id) }, 'read', Date.now()).allowed) return null;
  return { farm: record.farm_json, progression: record.progression_json, revision: Number(record.revision) };
}
export async function applyOwnedSnapshot(principal: Principal, body: unknown) {
  if (!body || typeof body !== 'object') return { status: 400, error: 'INVALID_REQUEST' };
  const v = body as Record<string, unknown>;
  if (!isValidCommand(v.command) || v.command.action !== 'backup' || !isValidFarm(v.farm) || !validProgression(v.progression) || !Number.isSafeInteger(v.expectedRevision) || Number(v.expectedRevision) < 0) return { status: 400, error: 'INVALID_REQUEST' };
  const command = v.command;
  const sql = db();
  return sql.begin(async tx => {
    const rows = await tx`SELECT id, owner_id, revision FROM farm_states WHERE id = ${command.farmId} AND owner_id = ${principal.userId} FOR UPDATE`;
    if (!rows.length) return { status: 404, error: 'FARM_NOT_FOUND' };
    if (!authorizeFarm(principal, { id: String(rows[0].id), ownerId: String(rows[0].owner_id) }, 'backup', Date.now()).allowed) return { status: 403, error: 'FORBIDDEN' };
    const prior = await tx`SELECT response_json FROM farm_requests WHERE farm_id = ${command.farmId} AND request_id = ${command.requestId} LIMIT 1`;
    if (prior.length) return { status: 200, result: prior[0].response_json };
    if (Number(rows[0].revision) !== v.expectedRevision) return { status: 409, error: 'REVISION_CONFLICT' };
    const nextRevision = Number(rows[0].revision) + 1;
    await tx`UPDATE farm_states SET farm_json = ${JSON.stringify(v.farm)}::jsonb, progression_json = ${JSON.stringify(v.progression)}::jsonb, revision = ${nextRevision}, updated_at = now() WHERE id = ${command.farmId} AND owner_id = ${principal.userId}`;
    const result = { revision: nextRevision };
    await tx`INSERT INTO farm_requests (farm_id, request_id, response_json) VALUES (${command.farmId}, ${command.requestId}, ${JSON.stringify(result)}::jsonb)`;
    return { status: 200, result };
  });
}
