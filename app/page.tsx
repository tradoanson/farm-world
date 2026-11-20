'use client';
import { useEffect, useState } from 'react';

const SAVE_KEY = 'farm-world-v01b-save';
const crops = [
  { name: 'Lúa mì', emoji: '🌾', seconds: 120, cost: 1 },
  { name: 'Ngô', emoji: '🌽', seconds: 300, cost: 3 },
  { name: 'Cà rốt', emoji: '🥕', seconds: 600, cost: 5 },
  { name: 'Cà chua', emoji: '🍅', seconds: 900, cost: 7 },
  { name: 'Dâu tây', emoji: '🍓', seconds: 1200, cost: 10 },
] as const;
type Tile = { crop: number; planted: number } | null;
type Save = { version: 1; tiles: Tile[]; coins: number; harvested: number };
const initial = (): Save => ({ version: 1, tiles: Array(64).fill(null), coins: 100, harvested: 0 });
function validSave(value: unknown): value is Save {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<Save>;
  return v.version === 1 && Number.isSafeInteger(v.coins) && (v.coins ?? -1) >= 0 && Number.isSafeInteger(v.harvested) && (v.harvested ?? -1) >= 0 && Array.isArray(v.tiles) && v.tiles.length === 64 && v.tiles.every(t => t === null || (typeof t === 'object' && Number.isInteger(t.crop) && t.crop >= 0 && t.crop < crops.length && Number.isFinite(t.planted) && t.planted > 0));
}
function formatRemaining(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, '0')}`;
}
export default function Home() {
  const [save, setSave] = useState<Save>(initial);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(0);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState('Chọn hạt giống rồi nhấn vào ô đất trống.');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validSave(parsed)) setSave(parsed);
        else setMessage('Dữ liệu lưu không hợp lệ, đã bắt đầu nông trại mới.');
      }
    } catch {
      setMessage('Không thể đọc dữ liệu đã lưu. Trò chơi bắt đầu từ đầu.');
    }
    setLoaded(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
    catch { /* Storage may be disabled; gameplay remains available for this session. */ }
  }, [save, loaded]);

  function clickTile(index: number) {
    if (!loaded) return;
    const t = save.tiles[index];
    const timestamp = Date.now();
    if (!t) {
      const crop = crops[selected];
      if (save.coins < crop.cost) { setMessage('Không đủ vàng để mua hạt giống.'); return; }
      setSave(prev => ({ ...prev, coins: prev.coins - crop.cost, tiles: prev.tiles.map((tile, i) => i === index ? { crop: selected, planted: timestamp } : tile) }));
      setMessage(`Đã gieo ${crop.name}. Chờ cây trưởng thành để thu hoạch!`);
      return;
    }
    const crop = crops[t.crop];
    const remaining = Math.max(0, Math.ceil((t.planted + crop.seconds * 1000 - timestamp) / 1000));
    if (remaining > 0) { setMessage(`${crop.name} còn ${formatRemaining(remaining)} để thu hoạch.`); return; }
    setSave(prev => ({ ...prev, coins: prev.coins + crop.cost * 3, harvested: prev.harvested + 1, tiles: prev.tiles.map((tile, i) => i === index ? null : tile) }));
    setMessage(`Thu hoạch ${crop.name}: +${crop.cost * 3} vàng!`);
  }
  function reset() {
    if (!window.confirm('Xóa toàn bộ tiến độ nông trại trên trình duyệt này?')) return;
    setSave(initial());
    setMessage('Đã tạo nông trại mới.');
  }
  const growing = save.tiles.filter(t => t && now < t.planted + crops[t.crop].seconds * 1000).length;
  const ready = save.tiles.filter(t => t && now >= t.planted + crops[t.crop].seconds * 1000).length;
  return <main>
    <header><div><span className="brand">🌻 FARM WORLD</span><small>V0.1B • Nông trại offline</small></div><div className="wallet">🪙 {save.coins} vàng <span>📦 {save.harvested} lượt thu hoạch</span></div></header>
    <section className="hero"><h1>Nông trại của bạn 🌿</h1><p>Gieo trồng, chờ cây lớn và thu hoạch để kiếm vàng.</p><p className="warning">Tiến độ tự lưu trên trình duyệt này. Chưa đồng bộ giữa thiết bị, chưa có tài khoản online hoặc cơ sở dữ liệu.</p></section>
    <div className="layout"><aside><h2>🌱 Cửa hàng hạt giống</h2>{crops.map((crop, i) => <button key={crop.name} className={'seed ' + (selected === i ? 'active' : '')} onClick={() => setSelected(i)} aria-pressed={selected === i}><span>{crop.emoji} {crop.name}</span><small>{crop.cost} 🪙 · {crop.seconds / 60} phút</small></button>)}<p className="hint">Lợi nhuận mỗi lần thu hoạch: gấp 3 lần giá hạt giống. Cây vẫn lớn khi bạn đóng trang, theo đồng hồ thiết bị.</p><button className="refresh" onClick={() => setNow(Date.now())}>↻ Cập nhật thời gian</button><button className="reset" onClick={reset}>Xóa tiến độ / chơi lại</button></aside>
    <section className="farm"><div className="farm-title">🏡 Khu đất khởi đầu <span>8 × 8</span></div><p className="stats">🌱 Đang lớn: {growing} &nbsp; 🌟 Có thể thu hoạch: {ready}</p><p className="status" role="status">{message}</p><div className="tiles">{save.tiles.map((t, i) => { const crop = t ? crops[t.crop] : null; const remaining = t && crop ? Math.max(0, Math.ceil((t.planted + crop.seconds * 1000 - now) / 1000)) : 0; const ripe = !!t && remaining === 0; return <button key={i} onClick={() => clickTile(i)} disabled={!loaded} className={'tile ' + (ripe ? 'ready' : '')} aria-label={`Ô đất ${i + 1}: ${!t ? 'trống' : ripe ? crop?.name + ' đã chín' : crop?.name + ' còn ' + formatRemaining(remaining)}`} title={!t ? 'Gieo hạt' : ripe ? 'Thu hoạch' : formatRemaining(remaining)}><span>{!t ? '·' : ripe ? crop?.emoji : '🌱'}</span>{t && !ripe && <small className="countdown">{formatRemaining(remaining)}</small>}</button>; })}</div><div className="footnote">🟫 Đất trống &nbsp; 🌱 Đang lớn &nbsp; 🌟 Có thể thu hoạch</div></section></div>
    <footer>Farm World V0.1B • Demo chạy trên GitHub Pages • Không dùng tài sản của trò chơi khác</footer>
  </main>;
}
