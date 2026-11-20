'use client';
import {useEffect,useRef,useState} from 'react';
import {createClient,type SupabaseClient,type User} from '@supabase/supabase-js';
import {CROPS,timeLabel} from '../lib/farm-demo';
import {applyOnlineCommand,createOnlineFarm,readOnlineSnapshot,type OnlineCommand,type OnlineSnapshot} from '../lib/farm-online';
import {clampZoom,hasDragged,pinchZoom} from '../lib/farm-camera';
import {bulkPlan,plantEstimate} from '../lib/farm-bulk';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured=!!url&&!!key&&url.startsWith('https://');
let shared:SupabaseClient|null=null;
function api(){return configured?(shared??=createClient(url!,key!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})):null;}
type Pending={command:OnlineCommand;requestId:string};
const pendingKey=(id:string)=>'farm-world-v1-pending-'+id;
function restore(id:string):Pending|null{try{const raw=localStorage.getItem(pendingKey(id));if(!raw)return null;const v=JSON.parse(raw) as Pending;if(!v||!v.command||typeof v.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(v.requestId))return null;return v;}catch{return null;}}
export default function Home(){
 const [user,setUser]=useState<User|null>(null);
 const [email,setEmail]=useState('');
 const [snapshot,setSnapshot]=useState<OnlineSnapshot|null>(null);
 const [busy,setBusy]=useState(false);
 const [bulkProgress,setBulkProgress]=useState('');
 const [notice,setNotice]=useState('Đăng nhập để chơi nông trại online.');
 const [selected,setSelected]=useState(0);
 const [now,setNow]=useState(0);
 const [pending,setPending]=useState<Pending|null>(null);
 const [view,setView]=useState<'isometric'|'classic'>('isometric');
 const [zoom,setZoom]=useState(1);
 const [pan,setPan]=useState({x:0,y:0});
 const pointer=useRef<{x:number;y:number;panX:number;panY:number;moved:boolean}|null>(null);
 const fingers=useRef(new Map<number,{x:number;y:number}>());
 const pinch=useRef<{distance:number;zoom:number}|null>(null);
 const suppress=useRef(false);
 const userId=useRef<string|null>(null);
 const busyRef=useRef(false);
 function resetCamera(){setZoom(1);setPan({x:0,y:0});}
 useEffect(()=>{
  setNow(Date.now());
  const timer=window.setInterval(()=>setNow(Date.now()),1000);
  const client=api();
  if(!client)return()=>window.clearInterval(timer);
  function update(u:User|null){const next=u?.id??null;if(userId.current!==next){userId.current=next;setSnapshot(null);setPending(next?restore(next):null);}setUser(u);}
  void client.auth.getUser().then(({data})=>update(data.user));
  const {data:listener}=client.auth.onAuthStateChange((_event,session)=>update(session?.user??null));
  return()=>{window.clearInterval(timer);listener.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{if(!user)return;const client=api();if(!client)return;let cancelled=false;void readOnlineSnapshot(client,user.id).then(s=>{if(!cancelled)setSnapshot(s);}).catch(()=>{if(!cancelled)setNotice('Không thể tải nông trại từ máy chủ.');});return()=>{cancelled=true;};},[user?.id]);
 useEffect(()=>{if(!user)return;const client=api();if(!client)return;let cancelled=false;async function sync(){if(document.visibilityState!=='visible'||busyRef.current||!client)return;try{const next=await readOnlineSnapshot(client,user!.id);if(!cancelled&&!busyRef.current)setSnapshot(next);}catch{/* Keep last confirmed snapshot. */}}const onFocus=()=>{void sync();};window.addEventListener('focus',onFocus);document.addEventListener('visibilitychange',onFocus);const timer=window.setInterval(onFocus,30000);return()=>{cancelled=true;window.clearInterval(timer);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus);};},[user?.id]);
 async function login(){const client=api();if(!client||!email.trim()||busy)return;setBusy(true);try{const {error}=await client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin+window.location.pathname}});setNotice(error?'Không gửi được liên kết đăng nhập.':'Đã gửi liên kết. Hãy mở email để xác thực.');}catch{setNotice('Không kết nối được dịch vụ đăng nhập.');}finally{busyRef.current=false;setBusy(false);}}
 async function create(){const client=api();if(!client||!user||busy||pending)return;busyRef.current=true;setBusy(true);try{await createOnlineFarm(client);setSnapshot(await readOnlineSnapshot(client,user.id));setNotice('Nông trại online đã sẵn sàng.');}catch{setNotice('Không tạo hoặc tải được nông trại online.');}finally{busyRef.current=false;setBusy(false);}}
 async function refresh(){const client=api();if(!client||!user||busy)return;busyRef.current=true;setBusy(true);try{setSnapshot(await readOnlineSnapshot(client,user.id));setNotice('Đã tải dữ liệu mới nhất từ máy chủ.');}catch{setNotice('Không thể tải lại dữ liệu.');}finally{busyRef.current=false;setBusy(false);}}
 async function command(c:OnlineCommand,retry=false){const client=api();if(!client||!user||busy||(!retry&&pending))return;const task=retry&&pending?pending:{command:c,requestId:crypto.randomUUID()};try{localStorage.setItem(pendingKey(user.id),JSON.stringify(task));}catch{setNotice('Không thể lưu mã yêu cầu. Không gửi lệnh để tránh xử lý trùng.');return;}setPending(task);busyRef.current=true;setBusy(true);try{await applyOnlineCommand(client,task.command,task.requestId);const s=await readOnlineSnapshot(client,user.id);if(!s)throw new Error('Missing farm');setSnapshot(s);localStorage.removeItem(pendingKey(user.id));setPending(null);setNotice('Máy chủ đã xác nhận lệnh và lưu nông trại.');}catch{setNotice('Chưa xác nhận được lệnh. Kiểm tra lại hoặc thử lại bằng cùng mã; không gửi lệnh mới.');}finally{busyRef.current=false;setBusy(false);}}
 async function bulk(action:'plant'|'harvest'){
  const client=api();if(!client||!user||!snapshot||busy||pending)return;
  const targets=bulkPlan(snapshot,action,selected,Date.now());
  const affordable=targets.length;
  if(!affordable){setNotice(action==='plant'?'Không có ô trống hoặc không đủ vàng.':'Không có cây đã chín.');return;}
  busyRef.current=true;
  setBusy(true);let completed=0;let failure=false;
  try{
   for(const index of targets.slice(0,affordable)){
    const c:OnlineCommand=action==='plant'?{action:'plant',index,crop:selected}:{action:'harvest',index};
    const task:Pending={command:c,requestId:crypto.randomUUID()};
    try{localStorage.setItem(pendingKey(user.id),JSON.stringify(task));}catch{setNotice('Không lưu được mã lệnh. Đã dừng để tránh trùng thao tác.');failure=true;break;}
    setPending(task);setBulkProgress(`${action==='plant'?'Đang gieo':'Đang thu hoạch'} ${completed+1}/${affordable}`);
    try{
     await applyOnlineCommand(client,c,task.requestId);
     const next=await readOnlineSnapshot(client,user.id);
     if(!next)throw new Error('Missing snapshot');
     setSnapshot(next);localStorage.removeItem(pendingKey(user.id));setPending(null);completed++;
    }catch{setNotice('Đã dừng sau '+completed+' ô. Có lệnh chưa xác nhận; kiểm tra máy chủ hoặc thử lại cùng mã.');failure=true;break;}
   }
   if(!failure)setNotice(`Máy chủ xác nhận ${completed} ô ${action==='plant'?'đã gieo':'đã thu hoạch'}.`);
  }finally{setBulkProgress('');busyRef.current=false;setBusy(false);}
 }
 function clickTile(index:number){if(!snapshot||busy||pending||suppress.current)return;const tile=snapshot.plots.find(p=>p.index===index);if(tile?.crop!=null){const seconds=Math.max(0,Math.ceil((Date.parse(tile.plantedAt!)+CROPS[tile.crop].seconds*1000-now)/1000));if(seconds>0){setNotice('Cây còn '+timeLabel(seconds)+'.');return;}void command({action:'harvest',index});}else{if(snapshot.coins<CROPS[selected].cost){setNotice('Không đủ vàng.');return;}void command({action:'plant',index,crop:selected});}}
 function pointerDown(e:React.PointerEvent<HTMLDivElement>){if(view!=='isometric')return;fingers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(e.pointerType==='mouse'&&e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);if(fingers.current.size===1){pointer.current={x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y,moved:false};pinch.current=null;}else if(fingers.current.size===2){const [a,b]=[...fingers.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};pointer.current=null;suppress.current=true;}}
 function pointerMove(e:React.PointerEvent<HTMLDivElement>){if(view!=='isometric'||!fingers.current.has(e.pointerId))return;fingers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(fingers.current.size===2&&pinch.current){const [a,b]=[...fingers.current.values()];setZoom(pinchZoom(pinch.current.zoom,pinch.current.distance,Math.hypot(a.x-b.x,a.y-b.y)));suppress.current=true;}else if(pointer.current){const dx=e.clientX-pointer.current.x,dy=e.clientY-pointer.current.y;if(hasDragged(dx,dy))pointer.current.moved=true;if(pointer.current.moved){suppress.current=true;setPan({x:pointer.current.panX+dx,y:pointer.current.panY+dy});}}}
 function pointerUp(e:React.PointerEvent<HTMLDivElement>){fingers.current.delete(e.pointerId);pointer.current=null;pinch.current=null;}
 const plots=Array.from({length:64},(_,i)=>snapshot?.plots.find(p=>p.index===i)??null);
 const ready=plots.filter(p=>p?.crop!=null&&now-Date.parse(p.plantedAt!)>=CROPS[p.crop].seconds*1000).length;
 const growing=plots.filter(p=>p?.crop!=null&&now-Date.parse(p.plantedAt!)<CROPS[p.crop].seconds*1000).length;
 const level=snapshot?Math.floor(Math.sqrt(snapshot.xp/25))+1:1;
 const estimate=plantEstimate(snapshot,selected);
 return <main>
  <header><div><span className="brand">🌻 FARM WORLD</span><small>V1.1 · Online Supabase</small></div><div className="wallet">🪙 {snapshot?.coins??'—'} vàng <span>⭐ Cấp {level} · {snapshot?.xp??0} XP</span></div></header>
  <section className="hero"><h1>Nông trại của bạn 🌿</h1><p>Một nông trại duy nhất. Mọi thao tác trồng, thu hoạch, bán và nhận thưởng đều gửi đến Supabase.</p>
   {!configured?<p role="alert">Kết nối Supabase chưa được cấu hình. Không thể chơi khi chưa kết nối máy chủ.</p>:
    !user?<div className="account-status"><strong>Đăng nhập để chơi online</strong><div className="account-actions"><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email đăng nhập" aria-label="Email đăng nhập"/><button disabled={busy||!email.trim()} onClick={()=>void login()}>Gửi liên kết đăng nhập</button></div></div>:
    <div className="account-status"><strong>👤 {user.email??'Người chơi'} · Online</strong><div className="account-actions">{!snapshot?<button disabled={busy||!!pending} onClick={()=>void create()}>Tạo / mở nông trại</button>:null}<button disabled={busy} onClick={()=>void refresh()}>↻ Tải lại từ máy chủ</button><button disabled={busy||!!pending} onClick={()=>void api()?.auth.signOut()}>Đăng xuất</button></div></div>}
   {pending&&<div className="account-status" role="alert"><strong>⚠️ Có lệnh chưa xác nhận: {pending.command.action}</strong><p>Không gửi lệnh khác trước khi kiểm tra.</p><div className="account-actions"><button disabled={busy} onClick={()=>void refresh()}>Kiểm tra máy chủ</button><button disabled={busy} onClick={()=>void command(pending.command,true)}>Thử lại cùng mã</button><button disabled={busy} onClick={()=>{if(user&&window.confirm('Chỉ đóng khi đã kiểm tra dữ liệu máy chủ.')){localStorage.removeItem(pendingKey(user.id));setPending(null);}}}>Đã đối chiếu, đóng cảnh báo</button></div></div>}
  </section>
  <div className="layout"><aside><h2>🌱 Hạt giống</h2><div className="seed-strip">{CROPS.map((crop,i)=><button key={crop.name} className={'seed '+(selected===i?'active':'')} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{crop.emoji} {crop.name}</span><small>{crop.cost} 🪙 · {crop.seconds/60} phút</small></button>)}</div>
   <h2>📦 Kho online</h2><div className="inventory">{CROPS.map((crop,i)=><div className="inventory-item" key={crop.name}><span>{crop.emoji} {crop.name}: <strong>{snapshot?.inventory[i]??0}</strong></span><button disabled={!snapshot||busy||!!pending||!snapshot.inventory[i]} onClick={()=>void command({action:'sell',crop:i,quantity:snapshot!.inventory[i]})}>Bán tất cả · {crop.cost*3} 🪙/sp</button></div>)}</div>
   <h2>📋 Nhiệm vụ</h2><div className="quests">{[{name:'Thu hoạch 5 lần',target:5,value:snapshot?.harvested??0,reward:20},{name:'Bán 10 sản phẩm',target:10,value:snapshot?.sold??0,reward:35},{name:'Đạt cấp 3',target:3,value:level,reward:50}].map((q,i)=><div className="quest" key={q.name}><span>{q.name} ({Math.min(q.target,q.value)}/{q.target}) · +{q.reward} 🪙</span><button disabled={!snapshot||busy||!!pending||q.value<q.target||snapshot.claimed.includes(i)} onClick={()=>void command({action:'claim',quest:i})}>{snapshot?.claimed.includes(i)?'Đã nhận':'Nhận'}</button></div>)}</div>
   <h2 className="tools-title">🧰 Công cụ</h2><p className="hint">Có thể gieo {estimate.affordable}/{estimate.empty} ô trống bằng {CROPS[selected].name}. Cần {estimate.totalCost} vàng để gieo hết{estimate.missing>0?' (thiếu '+estimate.missing+' vàng)':''}.</p><button className="refresh" disabled={!snapshot||busy||!!pending||!plots.some(p=>p?.crop==null)||snapshot.coins<CROPS[selected].cost} onClick={()=>void bulk('plant')}>🌱 Gieo toàn bộ ô trống</button><button className="refresh" disabled={!snapshot||busy||!!pending||!ready} onClick={()=>void bulk('harvest')}>🧺 Thu hoạch toàn bộ ô chín ({ready})</button><p className="hint">{bulkProgress||'Thao tác hàng loạt được máy chủ xác nhận từng ô; nếu gián đoạn sẽ dừng an toàn.'}</p></aside>
   <section className="farm" id="farm-board"><div className="farm-title">🏡 Nông trại online <span>8 × 8</span></div><p className="stats">🟫 Trống: {64-ready-growing} &nbsp; 🌱 Đang lớn: {growing} &nbsp; 🌟 Đã chín: {ready}</p><p className="status" role="status">{notice}</p><div className="view-switch" role="group" aria-label="Chế độ hiển thị"><button className={view==='isometric'?'active':''} onClick={()=>{setView('isometric');resetCamera();}}>◇ Isometric</button><button className={view==='classic'?'active':''} onClick={()=>{setView('classic');resetCamera();}}>▦ Cổ điển</button></div><div className="camera-toolbar"><button disabled={view!=='isometric'} onClick={()=>setZoom(v=>clampZoom(v-.15))}>−</button><output>{Math.round(zoom*100)}%</output><button disabled={view!=='isometric'} onClick={()=>setZoom(v=>clampZoom(v+.15))}>+</button><button onClick={resetCamera}>⌂ Đặt lại</button></div><p className="camera-hint">Kéo để di chuyển; chụm hai ngón để phóng to.</p>
   <div className={'farm-scene '+(view==='isometric'?'scene-iso':'scene-classic')} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClickCapture={e=>{if(suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false;}}}><div className="camera-layer" style={view==='isometric'?{transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}:undefined}><div className="farm-decor" aria-hidden="true"><span>🏠</span><span>🌳</span><span>🌻</span></div><div className="tiles">{plots.map((p,i)=>{const crop=p?.crop==null?null:CROPS[p.crop];const seconds=crop?Math.max(0,Math.ceil((Date.parse(p!.plantedAt!)+crop.seconds*1000-now)/1000)):0;const ripe=!!crop&&seconds===0;return <button key={i} disabled={!snapshot||busy||!!pending} onClick={()=>clickTile(i)} className={'tile '+(ripe?'ready':'')} title={!crop?'Gieo hạt':ripe?'Thu hoạch':timeLabel(seconds)} aria-label={`Ô đất ${i+1}: ${!crop?'trống':ripe?crop.name+' đã chín':crop.name+' còn '+timeLabel(seconds)}`}><span>{!crop?'·':ripe?crop.emoji:'🌱'}</span>{crop&&!ripe&&<small className="countdown">{timeLabel(seconds)}</small>}</button>;})}</div></div></div><div className="footnote">🟫 Trống · 🌱 Đang lớn · 🌟 Có thể thu hoạch</div></section>
  </div><footer>Farm World V1.1 Online · Supabase · Dữ liệu nông trại được lưu trên máy chủ. Dữ liệu offline cũ vẫn được giữ nguyên trong trình duyệt nhưng không sử dụng hoặc ghi đè.</footer>
 </main>;
}
