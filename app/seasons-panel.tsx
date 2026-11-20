'use client';
import {useState} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
type Season={season_id:string;title:string;ends_at:string;target_harvests:number;total_harvests:number;participants:number};
export default function SeasonsPanel({api}:{api:SupabaseClient}){
 const [seasons,setSeasons]=useState<Season[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function load(){if(busy)return;setBusy(true);try{const {data,error}=await api.rpc('farm_season_progress');if(error)throw error;
 setSeasons((data??[]).filter((s:Season)=>typeof s.title==='string'&&Number.isFinite(Number(s.target_harvests))&&Number(s.target_harvests)>0&&Number.isFinite(Number(s.total_harvests))));
 setNotice('Đã cập nhật tiến độ sự kiện.');}catch{setNotice('Sự kiện chưa được kích hoạt hoặc không thể kết nối.');}finally{setBusy(false);}}
 return <section className="economy-panel" aria-label="Sự kiện cộng đồng"><h2>🎉 Sự kiện cộng đồng</h2><p className="hint">Mục tiêu thu hoạch chung, tính từ dữ liệu máy chủ. Không có phần thưởng tự động ở phiên bản này.</p><button disabled={busy} onClick={()=>void load()}>↻ Xem mùa sự kiện</button><p role="status">{notice}</p>
 {seasons.map(s=>{const done=Number(s.total_harvests),goal=Number(s.target_harvests),pct=Math.max(0,Math.min(100,Math.round(done/goal*100)));return <div key={s.season_id}><strong>{s.title}</strong><p>{done.toLocaleString('vi-VN')}/{goal.toLocaleString('vi-VN')} lượt thu hoạch · {pct}% · {Number(s.participants).toLocaleString('vi-VN')} nông trại</p><progress value={pct} max={100} aria-label={'Tiến độ '+s.title}/><p className="hint">Kết thúc: {new Date(s.ends_at).toLocaleString('vi-VN')}</p></div>;})}
 </section>;
}
