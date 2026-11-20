'use client';
import {useEffect,useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {ANIMALS,type AnimalType} from '../lib/v3-production-contracts';
import {projectAnimalPen,type AnimalPen} from '../lib/v3-husbandry';
type PenRow={animal_type:AnimalType;animal_count:number;capacity:number;feed_stock:number;fed_at:string|null;collected_at:string|null};
type ProductRow={product:string;quantity:number};
type Pending={action:'buy'|'feed'|'collect';type:AnimalType;quantity:number;requestId:string};
const labels:Record<AnimalType,string>={chicken:'🐔 Gà',cow:'🐄 Bò',sheep:'🐑 Cừu'};
export default function Husbandry({client,farmId,userId}: {client:SupabaseClient;farmId:string;userId:string}){
 const [pens,setPens]=useState<PenRow[]>([]),[products,setProducts]=useState<ProductRow[]>([]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[now,setNow]=useState(0);
 const key='farm-world-v31-animal-pending-'+userId;
 const [pending,setPending]=useState<Pending|null>(null);
 async function reload(){
  const [p,i]=await Promise.all([
   client.from('farm_animal_pens').select('animal_type,animal_count,capacity,feed_stock,fed_at,collected_at').eq('farm_id',farmId),
   client.from('farm_animal_inventory').select('product,quantity').eq('farm_id',farmId)
  ]);
  if(p.error||i.error)throw new Error('Không tải được dữ liệu chăn nuôi.');
  setPens((p.data??[]) as PenRow[]);setProducts((i.data??[]) as ProductRow[]);
 }
 useEffect(()=>{setNow(Date.now());try{const raw=localStorage.getItem(key);setPending(raw?JSON.parse(raw) as Pending:null);}catch{setPending(null);}void reload().catch(()=>setMessage('Không tải được chuồng nuôi.'));const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[farmId,userId]);
 async function action(type:AnimalType,action:'buy'|'feed'|'collect',retry=false){
  if(busy||(!retry&&pending))return;
  const task=retry&&pending?pending:{type,action,quantity:1,requestId:crypto.randomUUID()};
  try{localStorage.setItem(key,JSON.stringify(task));}catch{setMessage('Không lưu được mã yêu cầu. Đã dừng để tránh giao dịch trùng.');return;}
  setPending(task);setBusy(true);
  try{
   const {error}=await client.rpc('farm_animal_action',{p_request_id:task.requestId,p_action:task.action,p_animal_type:task.type,p_quantity:task.quantity});
   if(error)throw error;
   await reload();
   localStorage.removeItem(key);setPending(null);setMessage('Máy chủ đã xác nhận '+(task.action==='buy'?'mua vật nuôi':task.action==='feed'?'cho ăn':'thu hoạch')+'.');
  }catch{setMessage('Giao dịch chưa được xác nhận. Tải lại dữ liệu hoặc thử lại bằng cùng mã yêu cầu.');}
  finally{setBusy(false);}
 }
 return <section className="husbandry-v31" aria-label="Chăn nuôi V3.1">
  <h2>🐾 Chăn nuôi V3.1</h2>
  <p>Vật nuôi và sản phẩm được lưu trên máy chủ. Cho ăn dùng vàng; chuồng có giới hạn sức chứa.</p>
  {ANIMALS.map(a=>{
   const row=pens.find(p=>p.animal_type===a.type);
   const pen:AnimalPen={type:a.type,count:row?.animal_count??0,capacity:row?.capacity??2,feedStock:row?.feed_stock??0,fedAt:row?.fed_at??null,collectedAt:row?.collected_at??null};
   let view;try{view=projectAnimalPen(pen,now||Date.now());}catch{return <p key={a.type}>Dữ liệu chuồng {a.type} không hợp lệ.</p>;}
   return <div key={a.type} className="husbandry-pen">
    <strong>{labels[a.type]} — {view.count}/{view.capacity}</strong>
    <span> Sản phẩm: {a.product} | Cần {view.feedNeeded} thức ăn/lượt</span>
    <span> {view.ready?'✅ Sẵn sàng thu hoạch':view.readyAt?'⏳ Còn '+view.secondsRemaining+' giây':'Chưa bắt đầu sản xuất'}</span>
    <div className="husbandry-actions">
     <button disabled={busy||!!pending||view.count>=view.capacity} onClick={()=>void action(a.type,'buy')}>Mua 1 con</button>
     <button disabled={busy||!!pending||view.count===0||!!view.readyAt} onClick={()=>void action(a.type,'feed')}>Cho ăn</button>
     <button disabled={busy||!!pending||!view.ready} onClick={()=>void action(a.type,'collect')}>Thu hoạch</button>
    </div>
   </div>;
  })}
  <p>📦 Sản phẩm: {ANIMALS.map(a=>a.product+': '+(products.find(p=>p.product===a.product)?.quantity??0)).join(' · ')}</p>
  {pending&&<button disabled={busy} onClick={()=>void action(pending.type,pending.action,true)}>Thử lại giao dịch chưa xác nhận</button>}
  <button disabled={busy} onClick={()=>void reload().then(()=>setMessage('Đã đồng bộ chuồng nuôi.')).catch(()=>setMessage('Không tải được dữ liệu.'))}>Tải lại chuồng nuôi</button>
  {message&&<p role="status">{message}</p>}
 </section>;
}
