'use client';
import { useEffect, useRef, useState } from 'react';
import { CROPS, SAVE_KEY, freshFarm, harvest, harvestAll, isValidFarm, plant, plantAvailable, remainingSeconds, timeLabel, type FarmSave } from '../lib/farm-demo';

export default function Home() {
  const [farm, setFarm] = useState<FarmSave>(freshFarm);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(0);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState('Chọn hạt giống và gieo trên ô đất trống.');
  const fileInput = useRef<HTMLInputElement>(null);
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
    <header><div><span className="brand">🌻 FARM WORLD</span><small>V0.2.1 • Nông trại offline</small></div><div className="wallet">🪙 {farm.coins} vàng <span>📦 {farm.harvested} lượt thu hoạch</span></div></header>
    <section className="hero"><h1>Nông trại của bạn 🌿</h1><p>Gieo trồng, chờ cây lớn, thu hoạch và phát triển nông trại.</p><p className="warning">Tự lưu trên trình duyệt này; có thể xuất/nhập file để chuyển thiết bị. Chưa có tài khoản online, đồng bộ cloud hoặc chống gian lận thời gian.</p></section>
    <div className="layout"><aside><h2>🌱 Cửa hàng hạt giống</h2><div className="seed-strip">{CROPS.map((crop, index) => <button key={crop.name} className={'seed ' + (selected === index ? 'active' : '')} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{crop.emoji} {crop.name}</span><small>{crop.cost} 🪙 · {crop.seconds / 60} phút</small></button>)}</div><p className="hint">Mỗi vụ thu hoạch nhận 3 lần giá hạt giống. Cây tiếp tục lớn khi đóng trang theo đồng hồ thiết bị.</p><h2 className="tools-title">🧰 Công cụ</h2><button className="refresh" disabled={!loaded || !empty} onClick={plantEmpty}>🌱 Gieo trên các ô trống</button><button className="refresh" disabled={!loaded || !ready} onClick={harvestReady}>🧺 Thu hoạch tất cả ({ready})</button><button className="secondary-action" disabled={!loaded} onClick={exportSave}>⬇ Xuất dữ liệu (.json)</button><button className="secondary-action" disabled={!loaded} onClick={() => fileInput.current?.click()}>⬆ Nhập dữ liệu</button><input ref={fileInput} className="hidden-input" type="file" accept=".json,application/json" aria-label="Chọn bản sao Farm World" onChange={event => { void importSave(event.target.files?.[0]); }} /><button className="reset" disabled={!loaded} onClick={reset}>Xóa tiến độ / chơi lại</button></aside>
    <section className="farm" id="farm-board"><div className="farm-title">🏡 Khu đất khởi đầu <span>8 × 8</span></div><p className="stats">🟫 Trống: {empty} &nbsp; 🌱 Đang lớn: {growing} &nbsp; 🌟 Đã chín: {ready}</p><p className="status" role="status">{notice}</p><div className="tiles">{farm.tiles.map((tile, index) => { const crop = tile ? CROPS[tile.crop] : null; const seconds = tile ? remainingSeconds(tile, now) : 0; const ripe = !!tile && seconds === 0; return <button key={index} disabled={!loaded} onClick={() => clickTile(index)} className={'tile ' + (ripe ? 'ready' : '')} title={!tile ? 'Gieo hạt' : ripe ? 'Thu hoạch' : timeLabel(seconds)} aria-label={`Ô đất ${index + 1}: ${!tile ? 'trống' : ripe ? crop?.name + ' đã chín' : crop?.name + ' còn ' + timeLabel(seconds)}`}><span>{!tile ? '·' : ripe ? crop?.emoji : '🌱'}</span>{tile && !ripe && <small className="countdown">{timeLabel(seconds)}</small>}</button>; })}</div><div className="footnote">🟫 Đất trống &nbsp; 🌱 Đang lớn &nbsp; 🌟 Có thể thu hoạch</div></section></div>
    <footer>Farm World V0.2.1 • GitHub Pages • Dữ liệu demo nằm trên thiết bị của bạn <span className="footer-links"><a href="https://github.com/tradoanson/farm-world/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">Lịch sử phiên bản</a><a href="https://github.com/tradoanson/farm-world/blob/main/futurebaseline.mb" target="_blank" rel="noopener noreferrer">Kế hoạch tiếp theo</a></span></footer>
  </main>;
}
