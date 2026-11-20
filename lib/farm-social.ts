import type {SupabaseClient} from '@supabase/supabase-js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type FriendRequest={id:string;sender_id:string;receiver_id:string;status:'pending'|'accepted'|'declined'|'cancelled';created_at:string};
export function validFriendId(id:unknown):id is string{return typeof id==='string'&&UUID.test(id);}
export function validateFriendRequest(value:unknown):FriendRequest{
 if(!value||typeof value!=='object')throw new Error('Invalid friend request');
 const v=value as Record<string,unknown>;
 if(!validFriendId(v.id)||!validFriendId(v.sender_id)||!validFriendId(v.receiver_id)||v.sender_id===v.receiver_id||!['pending','accepted','declined','cancelled'].includes(String(v.status))||typeof v.created_at!=='string'||!Number.isFinite(Date.parse(v.created_at)))throw new Error('Invalid friend request');
 return v as FriendRequest;
}
export async function sendFriendRequest(api:SupabaseClient,receiverId:string):Promise<string>{
 if(!validFriendId(receiverId))throw new Error('Invalid receiver');
 const {data,error}=await api.rpc('farm_friend_request',{p_receiver:receiverId});
 if(error||!validFriendId(data))throw new Error('Friend request not confirmed');
 return data;
}
export async function respondFriendRequest(api:SupabaseClient,requestId:string,accept:boolean):Promise<'accepted'|'declined'>{
 if(!validFriendId(requestId))throw new Error('Invalid request');
 const {data,error}=await api.rpc('farm_friend_respond',{p_request:requestId,p_accept:accept});
 if(error||(data!=='accepted'&&data!=='declined'))throw new Error('Friend response not confirmed');
 return data;
}
export async function listFriendRequests(api:SupabaseClient):Promise<FriendRequest[]>{
 const {data,error}=await api.from('farm_friend_requests').select('id,sender_id,receiver_id,status,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw new Error('Friend requests unavailable');
 return (data??[]).map(validateFriendRequest);
}
