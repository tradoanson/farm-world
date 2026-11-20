/** V0.5 authorization contract. Enforce on the server, never trust client farmId. */
export type Principal = { userId: string; sessionId: string; expiresAt: number };
export type FarmRecord = { id: string; ownerId: string };
export type FarmAction = 'read' | 'plant' | 'harvest' | 'sell' | 'claim' | 'backup';
export type AuthDecision = { allowed: true } | { allowed: false; reason: 'unauthenticated' | 'expired' | 'forbidden' | 'invalid' };
export function authorizeFarm(principal: Principal | null, farm: FarmRecord | null, _action: FarmAction, now: number): AuthDecision {
  if (!principal) return { allowed: false, reason: 'unauthenticated' };
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(principal.expiresAt) || principal.expiresAt <= now) return { allowed: false, reason: 'expired' };
  if (!principal.userId || !principal.sessionId || !farm?.id || !farm.ownerId) return { allowed: false, reason: 'invalid' };
  if (principal.userId !== farm.ownerId) return { allowed: false, reason: 'forbidden' };
  return { allowed: true };
}
export type CommandEnvelope = { requestId: string; farmId: string; action: FarmAction; payload: unknown };
export function isValidCommand(value: unknown): value is CommandEnvelope {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<CommandEnvelope>;
  return typeof c.requestId === 'string' && /^[a-zA-Z0-9_-]{16,100}$/.test(c.requestId) && typeof c.farmId === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(c.farmId) && ['read','plant','harvest','sell','claim','backup'].includes(c.action ?? '') && c.payload !== undefined;
}
