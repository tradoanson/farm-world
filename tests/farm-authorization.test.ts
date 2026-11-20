import { describe, expect, it } from 'vitest';
import { authorizeFarm, isValidCommand } from '../lib/farm-authorization';
const now = 1000;
const owner = { userId: 'u1', sessionId: 's1', expiresAt: 2000 };
const farm = { id: 'farm1', ownerId: 'u1' };
describe('V0.5 server authorization contract', () => {
  it('denies unauthenticated and expired sessions', () => {
    expect(authorizeFarm(null, farm, 'read', now)).toEqual({ allowed: false, reason: 'unauthenticated' });
    expect(authorizeFarm({ ...owner, expiresAt: now }, farm, 'sell', now)).toEqual({ allowed: false, reason: 'expired' });
  });
  it('enforces ownership on reads and mutations', () => {
    for (const action of ['read','plant','harvest','sell','claim','backup'] as const) {
      expect(authorizeFarm(owner, farm, action, now).allowed).toBe(true);
      expect(authorizeFarm({ ...owner, userId: 'u2' }, farm, action, now)).toEqual({ allowed: false, reason: 'forbidden' });
    }
  });
  it('rejects malformed command envelopes', () => {
    expect(isValidCommand({ requestId: 'request_1234567890', farmId: 'farm1', action: 'plant', payload: { index: 0 } })).toBe(true);
    expect(isValidCommand({ requestId: 'x', farmId: 'farm1', action: 'plant', payload: {} })).toBe(false);
    expect(isValidCommand({ requestId: 'request_1234567890', farmId: 'farm1', action: 'admin', payload: {} })).toBe(false);
  });
});
