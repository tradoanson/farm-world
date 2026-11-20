import {describe,it,expect} from 'vitest';
import {isCropReady} from '../server/crops';
describe('server crop readiness',()=>{it('does not mature early',()=>expect(isCropReady(1000,120,120999)).toBe(false));it('matures at deadline',()=>expect(isCropReady(1000,120,121000)).toBe(true));it('rejects invalid duration',()=>expect(isCropReady(1000,-1,999999)).toBe(false));});
