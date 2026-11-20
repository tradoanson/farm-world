'use client';
import {useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {CROPS} from '../lib/farm-demo';
type Listing={id:string;seller_id:string;crop:number;quantity:number;price_each:number;status:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const key=(id:string)=>'farm-world-market-pending-'+id;
export default function Marketplace({api,userId,inventory,onChanged}:{api:SupabaseClient;userId:string;inventory:number[];onChanged:()=>Promise<void>}){
 const [listings,setListings]=useState<Listing[]>([]);
 const [crop,setCrop]=useState(0),[quantity,setQuantity]=useState(1),[price,setPrice]=useState(3);
 const [pending,setPending]=useState<{listingId:string;requestId:string}|null>(()=>{if(typeof window==='undefined')return null;try{const v=JSON.parse(localStorage.getItem(key(userId))||'null');return v&&uuid.test(v.listingId)&&uuid.test(v.requestId)?v:null;}catch{return null;}});
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function load(){
  setBusy(true);try{const {data,error}=await api.from('farm_market_listings').select('id,seller_id,crop,quantity,price_each,status').eq('status','open').order('created_at',{ascending:false}).limit(50);if(error)throw error;
   setListings((data??[]).filter(v=>uuid.test(v.id)&&uuid.test(v.seller_id)&&Number.isSafeInteger(v.crop)&&v.crop>=0&&v.crop<CROPS.length&&Number.isSafeInteger(v.quantity)&&v.quantity>0&&Number.isSafeInteger(v.price_each)&&v.price_each>0));
   setMessage('Đã cập nhật tin đăng.');
  }catch{setMessage('Chợ chưa sẵn sàng hoặc không tải được tin đăng.');}finally{setBusy(false);}
 }
 async function list(){if(busy||pending||!Number.isSafeInteger(quantity)||quantity<1||quantity>10000||quantity>(inventory[crop]??0)||!Number.isSafeInteger(price)||price<1||price>100000)return;setBusy(true);try{const {error}=await api.rpc('farm_market_list',{p_crop:crop,p_quantity:quantity,p_price_each:price});if(error)throw error;await onChanged();await load();setMessage('Đã đăng bán và giữ hàng trong chợ.');}catch{setMessage('Không xác nhận được tin đăng. Tải lại chợ và kho trước khi thử lại.');}finally{setBusy(false);}}
 async function buy(listingId:string,retry=false){if(busy||(!retry&&pending))return;const task=retry&&pending?pending:{listingId,requestId:crypto.randomUUID()};try{localStorage.setItem(key(userId),JSON.stringify(task));}catch{setMessage('Không thể lưu mã giao dịch; đã dừng an toàn.');return;}setPending(task);setBusy(true);
  try{const {data,error}=await api.rpc('farm_market_buy',{p_listing:task.listingId,p_request:task.requestId});if(error||data?.listing_id!==task.listingId)throw new Error('Unconfirmed');
   await onChanged();localStorage.removeItem(key(userId));setPending(null);setMessage('Mua hàng thành công.');await load();
  }catch{setMessage('⚠️ Giao dịch chưa xác nhận. Chỉ thử lại với cùng mã, không gửi giao dịch mới.');}finally{setBusy(false);}
 }
 async function cancel(id:string){if(busy||pending)return;setBusy(true);try{const {data,error}=await api.rpc('farm_market_cancel',{p_listing:id});if(error||data!==true)throw new Error('Unconfirmed');await onChanged();await load();setMessage('Đã hủy và hoàn hàng về kho.');}catch{setMessage('Chưa xác nhận hủy tin. Kiểm tra lại trước khi thao tác.');}finally{setBusy(false);}}
 return <section className="economy-panel" aria-label="Chợ giao dịch">
  <h2>🛒 Chợ giao dịch</h2><p className="hint">Giao dịch do Supabase xác nhận. Giá niêm yết tính theo từng sản phẩm.</p>
  <button disabled={busy} onClick={()=>void load()}>↻ Tải tin đăng</button>
  {pending&&<div role="alert"><p>⚠️ Có giao dịch mua chưa xác nhận. Không gửi giao dịch khác.</p><button disabled={busy} onClick={()=>void buy(pending.listingId,true)}>Thử lại cùng mã</button></div>}
  <div className="account-actions"><select aria-label="Loại nông sản" value={crop} onChange={e=>setCrop(Number(e.target.value))}>{CROPS.map((c,i)=><option key={c.name} value={i}>{c.name} (kho {inventory[i]??0})</option>)}</select><input aria-label="Số lượng đăng" type="number" min="1" max="10000" value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/><input aria-label="Giá mỗi sản phẩm" type="number" min="1" max="100000" value={price} onChange={e=>setPrice(Number(e.target.value))}/><button disabled={busy||!!pending||quantity<1||quantity>(inventory[crop]??0)||price<1} onClick={()=>void list()}>Đăng bán</button></div>
  <p role="status">{message}</p><div className="inventory">{listings.map(l=><div className="inventory-item" key={l.id}><span>{CROPS[l.crop].emoji} {l.quantity} × {l.price_each} 🪙 = {l.quantity*l.price_each} 🪙</span>{l.seller_id===userId?<button disabled={busy||!!pending} onClick={()=>void cancel(l.id)}>Hủy tin của tôi</button>:<button disabled={busy||!!pending} onClick={()=>void buy(l.id)}>Mua</button>}</div>)}</div>
 </section>;
}
