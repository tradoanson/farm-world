'use client';
import {useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {CROPS} from '../lib/farm-demo';

type Listing={id:string;seller_id:string;crop:number;quantity:number;price_each:number;status:string;created_at:string};
type Pending={kind:'buy'|'list'|'cancel';requestId:string;listingId?:string;crop?:number;quantity?:number;price?:number};
const key=(id:string)=>'farm-v26-market-pending-'+id;
function recover(id:string):Pending|null{try{const x=JSON.parse(localStorage.getItem(key(id))||'null');return x&&['buy','list','cancel'].includes(x.kind)&&typeof x.requestId==='string'?x:null;}catch{return null;}}
export default function Marketplace({client,userId,inventory,onChanged}:{client:SupabaseClient|null;userId:string|null;inventory:number[];onChanged:()=>Promise<void>}){
 const [listings,setListings]=useState<Listing[]>([]);
 const [enabled,setEnabled]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('Chợ chỉ hoạt động khi migration V2.6 đã được nghiệm thu trên máy chủ.');
 const [crop,setCrop]=useState(0),[quantity,setQuantity]=useState(1),[price,setPrice]=useState(10);
 const [pending,setPending]=useState<Pending|null>(null);
 const unresolved=pending??(userId?recover(userId):null);
 async function refresh(){if(!client||!userId)return;setBusy(true);try{const {data,error}=await client.from('farm_market_listings').select('id,seller_id,crop,quantity,price_each,status,created_at').order('created_at',{ascending:false}).limit(40);if(error)throw error;setEnabled(true);setListings((data??[]) as Listing[]);setMessage('Đã đồng bộ danh sách từ máy chủ.');}catch{setEnabled(false);setMessage('Chợ chưa được kích hoạt hoặc không thể kết nối. Không thực hiện giao dịch.');}finally{setBusy(false)}}
 async function execute(task:Pending){if(!client||!userId||busy)return;setBusy(true);setPending(task);try{localStorage.setItem(key(userId),JSON.stringify(task));}catch{setMessage('Không lưu được mã giao dịch. Đã dừng an toàn.');setBusy(false);return;}
 try{
  if(task.kind==='buy'){const {error}=await client.rpc('farm_market_buy',{p_listing:task.listingId,p_request:task.requestId});if(error)throw error;}
  else if(task.kind==='list'){const {error}=await client.rpc('farm_market_list',{p_crop:task.crop,p_quantity:task.quantity,p_price_each:task.price,p_request:task.requestId});if(error)throw error;}
  else{const {error}=await client.rpc('farm_market_cancel',{p_listing:task.listingId,p_request:task.requestId});if(error)throw error;}
  await onChanged();
  localStorage.removeItem(key(userId));setPending(null);
  setMessage('Máy chủ đã xác nhận giao dịch.');setBusy(false);await refresh();
 }catch{setMessage('⚠️ Giao dịch chưa xác nhận. Không thực hiện lệnh mới; chỉ thử lại với cùng mã.');setBusy(false);}
 }
 const available=!!client&&!!userId&&enabled&&!busy&&!unresolved;
 return <section className="marketplace"><h2>🛒 Chợ nông sản V2.6</h2><p role="status">{message}</p><button type="button" disabled={!client||!userId||busy} onClick={()=>void refresh()}>↻ Kiểm tra và tải chợ</button>
 {unresolved&&<div role="alert"><p>⚠️ Có giao dịch {unresolved.kind} chưa xác nhận. Không gửi giao dịch mới.</p><button disabled={busy} onClick={()=>void execute(unresolved)}>Thử lại đúng mã giao dịch</button><button disabled={busy} onClick={()=>void refresh()}>Đối chiếu danh sách</button></div>}
 {enabled&&<><h3>Đăng bán nông sản</h3><div className="market-form"><label>Loại cây<select value={crop} onChange={e=>setCrop(Number(e.target.value))}>{CROPS.map((c,i)=><option key={c.name} value={i}>{c.name} (kho: {inventory[i]??0})</option>)}</select></label><label>Số lượng<input type="number" min="1" max="10000" value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label><label>Giá mỗi sản phẩm<input type="number" min="1" max="100000" value={price} onChange={e=>setPrice(Number(e.target.value))}/></label><button disabled={!available||!Number.isInteger(quantity)||quantity<1||quantity>10000||quantity>(inventory[crop]??0)||!Number.isInteger(price)||price<1||price>100000} onClick={()=>void execute({kind:'list',requestId:crypto.randomUUID(),crop,quantity,price})}>Đăng bán (khóa hàng trong chợ)</button></div>
 <h3>Tin đăng gần đây</h3><div className="market-list">{listings.length===0?<p>Chưa có tin đăng.</p>:listings.map(x=><div key={x.id}><strong>{CROPS[x.crop]?.emoji} {CROPS[x.crop]?.name??'Nông sản'} × {x.quantity}</strong><span>{x.price_each} 🪙/sp · Tổng {x.price_each*x.quantity} 🪙</span><span>{x.status==='open'?'Đang bán':x.status==='sold'?'Đã bán':'Đã hủy'}</span>{x.status==='open'&&(x.seller_id===userId?<button disabled={!available} onClick={()=>void execute({kind:'cancel',requestId:crypto.randomUUID(),listingId:x.id})}>Hủy tin</button>:<button disabled={!available} onClick={()=>void execute({kind:'buy',requestId:crypto.randomUUID(),listingId:x.id})}>Mua</button>)}</div>)}</div></>}
 </section>;
}
