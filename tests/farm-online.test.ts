import { describe, expect, it } from 'vitest';
import { parseOnlineResult, validateCommand } from '../lib/farm-online';
describe('V0.9 online boundary', () => {
  it('accepts bounded commands', () => { expect(() => validateCommand({action:'plant',index:63,crop:4})).not.toThrow(); expect(() => validateCommand({action:'harvest',index:0})).not.toThrow(); });
  it('rejects invalid plots and crops', () => {
    expect(() => validateCommand({action:'plant',index:-1,crop:0})).toThrow();
    expect(() => validateCommand({action:'plant',index:64,crop:0})).toThrow();
    expect(() => validateCommand({action:'plant',index:0,crop:5})).toThrow();
  });
  it('rejects forged or malformed RPC results', () => {
    expect(() => parseOnlineResult(null)).toThrow();
    expect(() => parseOnlineResult({farm_id:'x',coins:-1,harvested:0,revision:1,plot_index:0,action:'plant'})).toThrow();
    expect(() => parseOnlineResult({farm_id:'x',coins:100,harvested:0,revision:1,plot_index:64,action:'plant'})).toThrow();
  });
  it('accepts valid RPC result', () => {
    expect(parseOnlineResult({farm_id:'farm',coins:99,harvested:0,revision:1,plot_index:0,action:'plant'}).coins).toBe(99);
  });
});
