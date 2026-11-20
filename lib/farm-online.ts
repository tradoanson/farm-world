import type { SupabaseClient } from '@supabase/supabase-js';
export type OnlineSnapshot = { farmId:string; coins:number; harvested:number; revision:number; xp:number; sold:number; plots:{index:number;crop:number|null;plantedAt:string|null}[]; inventory:number[]; claimed:number[] };
export type OnlineCommand =
 | {action:'plant';index:number;crop:number}
 | {action:'harvest';index:number}
 | {action:'sell';crop:number;quantity:number}
 | {action:'claim';quest:number};
export type OnlineResult = {farm_id:string;coins:number;harvested:number;revision:number;xp:number;sold:number;action:string};
const validInt=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateCommand(c:OnlineCommand) {
 if(c.action==='plant'||c.action==='harvest') {
  if(!Number.isInteger(c.index)||c.index<0||c.index>63) throw new Error('Ô đất không hợp lệ.');
  if(c.action==='plant'&&(!Number.isInteger(c.crop)||c.crop<0||c.crop>4)) throw new Error('Hạt giống không hợp lệ.');
 } else if(c.action==='sell') {
  if(!Number.isInteger(c.crop)||c.crop<0||c.crop>4||!Number.isInteger(c.quantity)||c.quantity<1||c.quantity>100000) throw new Error('Lệnh bán không hợp lệ.');
 } else if(c.action==='claim') {
  if(!Number.isInteger(c.quest)||c.quest<0||c.quest>2) throw new Error('Nhiệm vụ không hợp lệ.');
 } else throw new Error('Lệnh không hợp lệ.');
}
export function parseOnlineResult(v:unknown):OnlineResult {
 if(!v||typeof v!=='object') throw new Error('Phản hồi máy chủ không hợp lệ.');
 const r=v as Record<string,unknown>;
 if(typeof r.farm_id!=='string'||!uuid.test(r.farm_id)||!['plant','harvest','sell','claim'].includes(String(r.action))||!validInt(r.coins)||!validInt(r.harvested)||!validInt(r.revision)||!validInt(r.xp)||!validInt(r.sold)) throw new Error('Phản hồi máy chủ không hợp lệ.');
 return r as OnlineResult;
}
export async function createOnlineFarm(api:SupabaseClient):Promise<string> {
 const {data,error}=await api.rpc('farm_create');
 if(error||typeof data!=='string'||!uuid.test(data)) throw new Error('Không thể tạo nông trại online.');
 return data;
}
export async function readOnlineSnapshot(api:SupabaseClient,ownerId:string):Promise<OnlineSnapshot|null> {
 const {data:farm,error:farmError}=await api.from('player_farms').select('id').eq('owner_id',ownerId).maybeSingle();
 if(farmError) throw new Error('Không thể kiểm tra nông trại online.');
 if(!farm) return null;
 const [stateResult,plotResult,inventoryResult,questResult]=await Promise.all([
  api.from('farm_state').select('coins,harvested,revision,xp,sold').eq('farm_id',farm.id).maybeSingle(),
  api.from('farm_plots').select('plot_index,crop,planted_at').eq('farm_id',farm.id).order('plot_index'),
  api.from('farm_inventory').select('crop,quantity').eq('farm_id',farm.id),
  api.from('farm_quests').select('quest').eq('farm_id',farm.id)
 ]);
 if(stateResult.error||plotResult.error||inventoryResult.error||questResult.error) throw new Error('Không thể đọc dữ liệu online.');
 const s=stateResult.data;
 if(!s||![s.coins,s.harvested,s.revision,s.xp,s.sold].every(validInt)) throw new Error('Trạng thái máy chủ không hợp lệ.');
 const plots=(plotResult.data??[]).map(p=>({index:p.plot_index,crop:p.crop,plantedAt:p.planted_at}));
 if(new Set(plots.map(p=>p.index)).size!==plots.length||plots.some(p=>!validInt(p.index)||p.index>63||(p.crop!==null&&(!validInt(p.crop)||p.crop>4||typeof p.plantedAt!=='string'||!Number.isFinite(Date.parse(p.plantedAt))))||(p.crop===null&&p.plantedAt!==null))) throw new Error('Ô đất máy chủ không hợp lệ.');
 const inventory=[0,0,0,0,0];
 for(const row of inventoryResult.data??[]) {
  if(!validInt(row.crop)||row.crop>4||!validInt(row.quantity)) throw new Error('Kho máy chủ không hợp lệ.');
  if(inventory[row.crop]!==0) throw new Error('Kho máy chủ trùng dữ liệu.');
  inventory[row.crop]=row.quantity;
 }
 const claimed:number[]=[];
 for(const row of questResult.data??[]) {
  if(!validInt(row.quest)||row.quest>2) throw new Error('Nhiệm vụ máy chủ không hợp lệ.');
  if(claimed.includes(row.quest)) throw new Error('Nhiệm vụ máy chủ trùng dữ liệu.');
  claimed.push(row.quest);
 }
 return {farmId:farm.id,coins:s.coins,harvested:s.harvested,revision:s.revision,xp:s.xp,sold:s.sold,plots,inventory,claimed};
}
// Keep the SAME requestId when retrying after uncertain network failure.
export async function applyOnlineCommand(api:SupabaseClient,command:OnlineCommand,requestId:string):Promise<OnlineResult> {
 validateCommand(command);
 if(!uuid.test(requestId)) throw new Error('Mã yêu cầu không hợp lệ.');
 const {data,error}=await api.rpc('farm_apply_command',{
  p_request_id:requestId,p_action:command.action,
  p_plot_index:command.action==='plant'||command.action==='harvest'?command.index:null,
  p_crop:command.action==='plant'||command.action==='sell'?command.crop:null,
  p_quantity:command.action==='sell'?command.quantity:null,
  p_quest:command.action==='claim'?command.quest:null
 });
 if(error) throw new Error('Lệnh online thất bại hoặc kết nối gián đoạn. Kiểm tra snapshot trước khi gửi lệnh mới.');
 return parseOnlineResult(data);
}
