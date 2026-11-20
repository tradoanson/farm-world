'use client';
import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { createOnlineFarm, readOnlineSnapshot, type OnlineSnapshot } from '../lib/farm-online';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured = !!url && !!key && /^https:\/\//.test(url);
let client: SupabaseClient | null = null;
function supabase() {
  if (!configured) return null;
  return client ??= createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}
export default function AccountPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<OnlineSnapshot | null>(null);
  useEffect(() => {
    const api = supabase();
    if (!api) return;
    void api.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = api.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSnapshot(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  async function sendLink() {
    const api = supabase();
    if (!api || !email.trim() || busy) return;
    setBusy(true);
    const { error } = await api.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
    setMessage(error ? 'Không thể gửi email đăng nhập. Kiểm tra cấu hình và thử lại.' : 'Nếu email hợp lệ, hãy kiểm tra hộp thư để đăng nhập.');
    setBusy(false);
  }
  async function readFarm() {
    const api = supabase();
    if (!api || !user) return;
    setBusy(true);
    try {
      const next = await readOnlineSnapshot(api, user.id);
      setSnapshot(next);
      setMessage(next ? 'Đã đọc dữ liệu máy chủ (chỉ xem). Chơi offline không bị thay đổi.' : 'Tài khoản chưa có nông trại online.');
    } catch {
      setSnapshot(null);
      setMessage('Không thể tải snapshot online. Dữ liệu offline vẫn an toàn.');
    }
    setBusy(false);
  }
  async function createFarm() {
    const api = supabase();
    if (!api || !user || busy) return;
    setBusy(true);
    try {
      await createOnlineFarm(api);
      const next = await readOnlineSnapshot(api, user.id);
      setSnapshot(next);
      setMessage('Đã tạo nông trại online mới. Dữ liệu offline vẫn được giữ nguyên.');
    } catch {
      setMessage('Không thể tạo hoặc tải nông trại online. Vui lòng thử lại.');
    } finally { setBusy(false); }
  }
  async function logout() {
    const api = supabase();
    if (!api) return;
    setBusy(true);
    const { error } = await api.auth.signOut();
    setMessage(error ? 'Đăng xuất chưa thành công.' : 'Đã đăng xuất tài khoản online.');
    setBusy(false);
  }
  return <div className="account-status" aria-label="Tài khoản Farm World">
    {!configured ? <span>👤 Khách offline · Tài khoản online chưa cấu hình · Dữ liệu vẫn lưu trên thiết bị</span> :
      user ? <div><strong>👤 {user.email ?? 'Người chơi'}</strong> · Tài khoản đã xác thực
        <div className="account-actions"><button type="button" disabled={busy} onClick={() => void createFarm()}>Tạo / mở nông trại online</button><button type="button" disabled={busy} onClick={() => void readFarm()}>Làm mới snapshot</button><button type="button" disabled={busy} onClick={() => void logout()}>Đăng xuất</button></div>
        {snapshot && <div role="status"><small>Mã nông trại: {snapshot.farmId}</small><p>☁️ Máy chủ: {snapshot.coins} vàng · {snapshot.harvested} lượt thu hoạch · {snapshot.xp} XP · Đã bán {snapshot.sold} · Revision {snapshot.revision} · {snapshot.plots.filter(p => p.crop !== null).length}/64 ô đã gieo.</p><p>📦 Kho online: {snapshot.inventory.join(" / ")} · Nhiệm vụ đã nhận: {snapshot.claimed.length}/3.</p><small>Đây là snapshot online độc lập, không ghi đè dữ liệu offline.</small></div>}
      </div> :
      <div><strong>👤 Khách offline</strong> · Đăng nhập online bằng email (thử nghiệm)
        <div className="account-actions"><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" aria-label="Email đăng nhập" /><button type="button" disabled={busy || !email.trim()} onClick={() => void sendLink()}>Gửi liên kết đăng nhập</button></div>
      </div>}
    {message && <p role="status">{message}</p>}
    <small>Chơi và lưu offline vẫn độc lập. Chưa đồng bộ vàng, kho hoặc tiến độ lên máy chủ.</small>
  </div>;
}
