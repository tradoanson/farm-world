import {describe,it,expect,vi} from 'vitest';
import type {SupabaseClient} from '@supabase/supabase-js';
import {applyOnlineCommand,createOnlineFarm,readOnlineSnapshot} from '../lib/farm-online';
const id='123e4567-e89b-42d3-a456-426614174000';
const request='123e4567-e89b-42d3-a456-426614174001';
const result={farm_id:id,coins:99,harvested:0,revision:1,xp:0,sold:0,action:'plant'};
describe('V1.0 Supabase adapter contract',()=>{
 it('sends all six RPC parameters and preserves request ID',async()=>{
  const rpc=vi.fn().mockResolvedValue({data:result,error:null});
  const api={rpc} as unknown as SupabaseClient;
  expect((await applyOnlineCommand(api,{action:'plant',index:2,crop:3},request)).revision).toBe(1);
  expect(rpc).toHaveBeenCalledWith('farm_apply_command',{p_request_id:request,p_action:'plant',p_plot_index:2,p_crop:3,p_quantity:null,p_quest:null});
  await applyOnlineCommand(api,{action:'sell',crop:1,quantity:2},request);
  expect(rpc).toHaveBeenLastCalledWith('farm_apply_command',{p_request_id:request,p_action:'sell',p_plot_index:null,p_crop:1,p_quantity:2,p_quest:null});
 });
 it('provisions farm via RPC',async()=>{
  const rpc=vi.fn().mockResolvedValue({data:id,error:null});
  expect(await createOnlineFarm({rpc} as unknown as SupabaseClient)).toBe(id);
  expect(rpc).toHaveBeenCalledWith('farm_create');
 });
 it('rejects network errors and invalid results',async()=>{
  const api={rpc:vi.fn().mockResolvedValue({data:null,error:{message:'network'}})} as unknown as SupabaseClient;
  await expect(applyOnlineCommand(api,{action:'harvest',index:0},request)).rejects.toThrow();
  await expect(createOnlineFarm(api)).rejects.toThrow();
 });
 it('reads server snapshot without writing to local storage',async()=>{
  const tables:Record<string,unknown>={
   player_farms:{data:{id},error:null},farm_state:{data:{coins:100,harvested:0,revision:0,xp:0,sold:0},error:null},
   farm_plots:{data:[],error:null},farm_inventory:{data:[],error:null},farm_quests:{data:[],error:null}
  };
  const from=vi.fn((name:string)=>({
   select:()=>({eq:()=>({maybeSingle:async()=>tables[name],order:async()=>tables[name],then:(resolve:(v:unknown)=>unknown)=>Promise.resolve(tables[name]).then(resolve)})})
  }));
  const snapshot=await readOnlineSnapshot({from} as unknown as SupabaseClient,id);
  expect(snapshot?.coins).toBe(100);
  expect(snapshot?.inventory).toEqual([0,0,0,0,0]);
  expect(from).toHaveBeenCalledTimes(5);
 });
});
