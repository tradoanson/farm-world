import type { SupabaseClient } from '@supabase/supabase-js';
export type OnlineSnapshot = { farmId: string; coins: number; harvested: number; revision: number; plots: { index: number; crop: number | null; plantedAt: string | null }[] };
export type OnlineCommand = { action: 'plant'; index: number; crop: number } | { action: 'harvest'; index: number };
export type OnlineResult = { farm_id: string; coins: number; harvested: number; revision: number; plot_index: number; action: string };
function integer(v: unknown): v is number { return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0; }
export function parseOnlineResult(v: unknown): OnlineResult {
  if (!v || typeof v !== 'object') throw new Error('Phản hồi máy chủ không hợp lệ.');
  const r = v as Record<string, unknown>;
  if (typeof r.farm_id !== 'string' || !integer(r.coins) || !integer(r.harvested) || !integer(r.revision) || !integer(r.plot_index) || r.plot_index > 63 || !['plant','harvest'].includes(String(r.action))) throw new Error('Phản hồi máy chủ không hợp lệ.');
  return r as OnlineResult;
}
export function validateCommand(c: OnlineCommand) {
  if (!Number.isInteger(c.index) || c.index < 0 || c.index > 63 || (c.action === 'plant' && (!Number.isInteger(c.crop) || c.crop < 0 || c.crop > 4))) throw new Error('Lệnh không hợp lệ.');
}
export async function readOnlineSnapshot(api: SupabaseClient, ownerId: string): Promise<OnlineSnapshot | null> {
  const { data: farm, error: farmError } = await api.from('player_farms').select('id').eq('owner_id', ownerId).maybeSingle();
  if (farmError) throw new Error('Không thể kiểm tra nông trại online.');
  if (!farm) return null;
  const [stateResult, plotResult] = await Promise.all([
    api.from('farm_state').select('coins,harvested,revision').eq('farm_id',farm.id).maybeSingle(),
    api.from('farm_plots').select('plot_index,crop,planted_at').eq('farm_id',farm.id).order('plot_index')
  ]);
  if (stateResult.error || plotResult.error) throw new Error('Không thể đọc dữ liệu online.');
  const state = stateResult.data;
  if (!state || !integer(state.coins) || !integer(state.harvested) || !integer(state.revision)) throw new Error('Trạng thái máy chủ không hợp lệ.');
  const plots = (plotResult.data ?? []).map(p => ({ index:p.plot_index as number, crop:p.crop as number | null, plantedAt:p.planted_at as string | null }));
  if (plots.some(p=>!Number.isInteger(p.index)||p.index<0||p.index>63||(p.crop!==null&&(!Number.isInteger(p.crop)||p.crop<0||p.crop>4))||(p.crop!==null&&(!p.plantedAt||!Number.isFinite(Date.parse(p.plantedAt)))))) throw new Error('Dữ liệu ô đất online không hợp lệ.');
  return { farmId:farm.id as string, coins:state.coins, harvested:state.harvested, revision:state.revision, plots };
}
// Caller MUST keep requestId stable when retrying an uncertain network response.
export async function applyOnlineCommand(api: SupabaseClient, command: OnlineCommand, requestId: string): Promise<OnlineResult> {
  validateCommand(command);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new Error('Mã yêu cầu không hợp lệ.');
  const { data, error } = await api.rpc('farm_apply_command', {
    p_request_id:requestId, p_action:command.action, p_plot_index:command.index, p_crop:command.action==='plant'?command.crop:null
  });
  if (error) throw new Error('Máy chủ từ chối lệnh hoặc kết nối bị gián đoạn. Kiểm tra trạng thái trước khi gửi lệnh mới.');
  return parseOnlineResult(data);
}
