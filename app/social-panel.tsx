'use client';
import {useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {listFriendRequests,respondFriendRequest,sendFriendRequest,type FriendRequest,validFriendId} from '../lib/farm-social';
export default function SocialPanel({api,userId}:{api:SupabaseClient;userId:string}){
 const [target,setTarget]=useState(''),[requests,setRequests]=useState<FriendRequest[]>([]);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function refresh(){setBusy(true);try{setRequests(await listFriendRequests(api));setNotice('Đã tải danh sách lời mời.');}catch{setNotice('Chức năng bạn bè chưa sẵn sàng hoặc không tải được dữ liệu.');}finally{setBusy(false);}}
 async function send(){if(!validFriendId(target)||target===userId||busy)return;setBusy(true);try{await sendFriendRequest(api,target);setNotice('Đã gửi lời mời kết bạn.');setTarget('');setRequests(await listFriendRequests(api));}catch{setNotice('Không thể gửi lời mời. Người nhận phải có hồ sơ công khai và không chặn bạn.');}finally{setBusy(false);}}
 async function respond(id:string,accept:boolean){if(busy)return;setBusy(true);try{await respondFriendRequest(api,id,accept);setRequests(await listFriendRequests(api));setNotice(accept?'Đã chấp nhận lời mời.':'Đã từ chối lời mời.');}catch{setNotice('Không xác nhận được phản hồi.');}finally{setBusy(false);}}
 return <section className="economy-panel" aria-label="Bạn bè"><h2>🤝 Bạn bè</h2><p className="hint">Chỉ gửi lời mời tới người chơi bật hồ sơ công khai. Chia sẻ mã người chơi để kết nối.</p>
 <p>Mã của bạn: <code>{userId}</code></p>
 <div className="account-actions"><input aria-label="Mã người chơi nhận lời mời" placeholder="UUID người chơi" value={target} onChange={e=>setTarget(e.target.value.trim())}/><button disabled={busy||!validFriendId(target)||target===userId} onClick={()=>void send()}>Gửi lời mời</button><button disabled={busy} onClick={()=>void refresh()}>↻ Tải lời mời</button></div>
 <p role="status">{notice}</p><div className="inventory">{requests.map(r=><div className="inventory-item" key={r.id}><span>{r.sender_id===userId?'Đã gửi tới: '+r.receiver_id:'Từ: '+r.sender_id} · {r.status}</span>{r.receiver_id===userId&&r.status==='pending'?<span><button disabled={busy} onClick={()=>void respond(r.id,true)}>Đồng ý</button><button disabled={busy} onClick={()=>void respond(r.id,false)}>Từ chối</button></span>:null}</div>)}</div>
 </section>;
}
