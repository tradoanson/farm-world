import {describe,it,expect,vi} from 'vitest';
import {validFriendId,validateFriendRequest,sendFriendRequest,respondFriendRequest} from '../lib/farm-social';
import type {SupabaseClient} from '@supabase/supabase-js';
const a='123e4567-e89b-42d3-a456-426614174000',b='123e4567-e89b-42d3-a456-426614174001';
describe('social boundary',()=>{
 it('rejects malformed IDs and self requests',()=>{
  expect(validFriendId('x')).toBe(false);
  expect(()=>validateFriendRequest({id:a,sender_id:a,receiver_id:a,status:'pending',created_at:new Date().toISOString()})).toThrow();
 });
 it('rejects unconfirmed RPC responses',async()=>{
  const api={rpc:vi.fn().mockResolvedValue({data:null,error:{message:'fail'}})} as unknown as SupabaseClient;
  await expect(sendFriendRequest(api,b)).rejects.toThrow();
  await expect(respondFriendRequest(api,a,true)).rejects.toThrow();
 });
 it('accepts validated server results',async()=>{
  const api={rpc:vi.fn().mockResolvedValueOnce({data:a,error:null}).mockResolvedValueOnce({data:'accepted',error:null})} as unknown as SupabaseClient;
  await expect(sendFriendRequest(api,b)).resolves.toBe(a);
  await expect(respondFriendRequest(api,a,true)).resolves.toBe('accepted');
 });
});
