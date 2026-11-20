'use client';
import { useEffect, useRef, useState } from 'react';
import { CROPS, SAVE_KEY, freshFarm, harvest, harvestAll, isValidFarm, plant, plantAvailable, remainingSeconds, timeLabel, type FarmSave } from '../lib/farm-demo';

export default function Home() {
  const [farm, setFarm] = useState<FarmSave>(freshFarm);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState<'isometric' | 'classic'>('isometric');
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState('Chọn hạt giống và gieo trên ô đất trống.');
  const fileInput = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const gesture = useRef<{ x: number; y: number; originX: number; originY: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const suppressClick = useRef(false);
  const clampZoom = (value: number) => Math.min(2, Math.max(0.65, value));
  function resetCamera() { setZoom(1); setPan({ x: 0, y: 0 }); }
  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (view !== 'isometric') return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 1) {
      gesture.current = { x: event.clientX, y: event.clientY, originX: pan.x, originY: pan.y, moved: false };
      pinch.current = null;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      gesture.current = null;
      suppressClick.current = true;
    }
  }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || view !== 'isometric') return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.distance > 0) setZoom(clampZoom(pinch.current.zoom * distance / pinch.current.distance));
      suppressClick.current = true;
    } else if (gesture.current && pointers.current.size === 1) {
      const dx = event.clientX - gesture.current.x;
      const dy = event.clientY - gesture.current.y;
      if (Math.hypot(dx, dy) > 8) gesture.current.moved = true;
      if (gesture.current.moved) {
        suppressClick.current = true;
        setPan({ x: gesture.current.originX + dx, y: gesture.current.originY + dy });
      }
    }
  }
  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (gesture.current?.moved || pinch.current) suppressClick.current = true;
    gesture.current = null;
    pinch.current = null;
  }
  function wheelZoom(event: React.WheelEvent<HTMLDivElement>) {
    if (view !== 'isometric' || !event.ctrlKey) return;
    event.preventDefault();
    setZoom(value => clampZoom(value + (event.deltaY < 0 ? 0.1 : -0.1)));
  }
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data: unknown = JSON.parse(saved);
        if (isValidFarm(data)) setFarm(data);
        else setNotice('Dữ liệu cũ không hợp lệ; bắt đầu nông trại mới.');
      }
    } catch { setNotice('Không thể đọc dữ liệu đã lưu.'); }
    setLoaded(true);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(farm)); }
    catch { setNotice('Trình duyệt không cho phép lưu. Hãy xuất bản sao dữ liệu.'); }
  }, [farm, loaded]);
  const ready = farm.tiles.filter(tile => tile && remainingSeconds(tile, now) === 0).length;
  const growing = farm.tiles.filter(tile => tile && remainingSeconds(tile, now) > 0).length;
  const empty = farm.tiles.length - ready - growing;
  function clickTile(index: number) {
    if (!loaded) return;
    if (suppressClick.current) { suppressClick.current = false; return; }
    const tile = farm.tiles[index];
    const time = Date.now();
    if (!tile) {
      const next = plant(farm, index, selected, time);
      if (next === farm) { setNotice('Không đủ vàng để gieo hạt giống này.'); return; }
      setFarm(next);
      setNotice(`Đã gieo ${CROPS[selected].name}.`);
    } else if (remainingSeconds(tile, time) === 0) {
      setFarm(harvest(farm, index, time));
      setNotice(`Thu hoạch ${CROPS[tile.crop].name}: +${CROPS[tile.crop].cost * 3} vàng.`);
    } else setNotice(`${CROPS[tile.crop].name} còn ${timeLabel(remainingSeconds(tile, time))}.`);
  }
  function harvestReady() {
    if (!ready) return;
    const next = harvestAll(farm, Date.now());
    setNotice(`Đã thu hoạch ${next.harvested - farm.harvested} ô.`);
    setFarm(next);
  }
  function plantEmpty() {
    const next = plantAvailable(farm, selected, Date.now());
    setNotice(next === farm ? 'Không có ô trống hoặc không đủ vàng.' : `Đã gieo ${CROPS[selected].name} trên ${next.tiles.filter(Boolean).length - farm.tiles.filter(Boolean).length} ô.`);
    setFarm(next);
  }
  function exportSave() {
    const blob = new Blob([JSON.stringify(farm, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'farm-world-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Đã xuất bản sao dữ liệu nông trại.');
  }
  async function importSave(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error('File quá lớn.');
      const parsed: unknown = JSON.parse(await file.text());
      if (!isValidFarm(parsed)) throw new Error('Dữ liệu không đúng định dạng Farm World.');
      if (!window.confirm('Nhập dữ liệu này sẽ ghi đè nông trại hiện tại. Tiếp tục?')) return;
      setFarm(parsed);
      setNotice('Đã khôi phục nông trại từ file.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Không thể nhập file.'); }
    finally { if (fileInput.current) fileInput.current.value = ''; }
  }
  function reset() {
    if (!window.confirm('Xóa toàn bộ tiến độ nông trại trên trình duyệt này?')) return;
    setFarm(freshFarm());
    setNotice('Đã tạo nông trại mới.');
  }
  return <main>
    <header><div><span className="brand">🌻 FARM WORLD</span><small>V0.3B • Isometric demo</small></div><div className="wallet">🪙 {farm.coins} vàng <span>📦 {farm.harvested} lượt thu hoạch</span></div></header>
    <section className="hero"><h1>Nông trại của bạn 🌿</h1><p>Gieo trồng, chờ cây lớn, thu hoạch và phát triển nông trại.</p><p className="warning">Tự lưu trên trình duyệt này; có thể xuất/nhập file để chuyển thiết bị. Chưa có tài khoản online, đồng bộ cloud hoặc chống gian lận thời gian.</p></section>
    <div className="layout"><aside><h2>🌱 Cửa hàng hạt giống</h2><div className="seed-strip">{CROPS.map((crop, index) => <button key={crop.name} className={'seed ' + (selected === index ? 'active' : '')} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{crop.emoji} {crop.name}</span><small>{crop.cost} 🪙 · {crop.seconds / 60} phút</small></button>)}</div><p className="hint">Mỗi vụ thu hoạch nhận 3 lần giá hạt giống. Cây tiếp tục lớn khi đóng trang theo đồng hồ thiết bị.</p><h2 className="tools-title">🧰 Công cụ</h2><button className="refresh" disabled={!loaded || !empty} onClick={plantEmpty}>🌱 Gieo trên các ô trống</button><button className="refresh" disabled={!loaded || !ready} onClick={harvestReady}>🧺 Thu hoạch tất cả ({ready})</button><button className="secondary-action" disabled={!loaded} onClick={exportSave}>⬇ Xuất dữ liệu (.json)</button><button className="secondary-action" disabled={!loaded} onClick={() => fileInput.current?.click()}>⬆ Nhập dữ liệu</button><input ref={fileInput} className="hidden-input" type="file" accept=".json,application/json" aria-label="Chọn bản sao Farm World" onChange={event => { void importSave(event.target.files?.[0]); }} /><button className="reset" disabled={!loaded} onClick={reset}>Xóa tiến độ / chơi lại</button></aside>
    <section className="farm" id="farm-board"><div className="farm-title">🏡 Khu đất khởi đầu <span>8 × 8</span></div><p className="stats">🟫 Trống: {empty} &nbsp; 🌱 Đang lớn: {growing} &nbsp; 🌟 Đã chín: {ready}</p><p className="status" role="status">{notice}</p><div className="view-switch" role="group" aria-label="Chế độ hiển thị"><button type="button" className={view === "isometric" ? "active" : ""} aria-pressed={view === "isometric"} onClick={() => { setView("isometric"); resetCamera(); }}>◇ Isometric</button><button type="button" className={view === "classic" ? "active" : ""} aria-pressed={view === "classic"} onClick={() => { setView("classic"); resetCamera(); }}>▦ Cổ điển</button></div><div className="camera-toolbar" aria-label="Điều khiển bản đồ"><button type="button" disabled={view !== 'isometric'} onClick={() => setZoom(value => clampZoom(value - .15))} aria-label="Thu nhỏ">−</button><output aria-label="Mức phóng đại">{Math.round(zoom * 100)}%</output><button type="button" disabled={view !== 'isometric'} onClick={() => setZoom(value => clampZoom(value + .15))} aria-label="Phóng to">+</button><button type="button" disabled={view !== 'isometric'} onClick={resetCamera}>⌂ Đặt lại</button></div><p className="camera-hint">Kéo bằng một ngón tay hoặc chuột để di chuyển; chụm hai ngón để zoom. Trên máy tính dùng Ctrl + cuộn.</p><div className={"farm-scene " + (view === "isometric" ? "scene-iso" : "scene-classic")} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheelZoom}><div className="camera-layer" style={view === 'isometric' ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` } : undefined}><div className="farm-decor" aria-hidden="true"><span>🏠</span><span>🌳</span><span>🌻</span></div><div className="tiles">{farm.tiles.map((tile, index) => { const crop = tile ? CROPS[tile.crop] : null; const seconds = tile ? remainingSeconds(tile, now) : 0; const ripe = !!tile && seconds === 0; return <button key={index} disabled={!loaded} onClick={() => clickTile(index)} className={'tile ' + (ripe ? 'ready' : '')} title={!tile ? 'Gieo hạt' : ripe ? 'Thu hoạch' : timeLabel(seconds)} aria-label={`Ô đất ${index + 1}: ${!tile ? 'trống' : ripe ? crop?.name + ' đã chín' : crop?.name + ' còn ' + timeLabel(seconds)}`}><span>{!tile ? '·' : ripe ? crop?.emoji : '🌱'}</span>{tile && !ripe && <small className="countdown">{timeLabel(seconds)}</small>}</button>; })}</div></div></div><div className="footnote">🟫 Đất trống &nbsp; 🌱 Đang lớn &nbsp; 🌟 Có thể thu hoạch</div></section></div>
    <footer>Farm World V0.3B • GitHub Pages • Dữ liệu demo nằm trên thiết bị của bạn <span className="footer-links"><a href="https://github.com/tradoanson/farm-world/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">Lịch sử phiên bản</a><a href="https://github.com/tradoanson/farm-world/blob/main/futurebaseline.md" target="_blank" rel="noopener noreferrer">Kế hoạch tiếp theo</a></span></footer>
  </main>;
}
