'use client';
import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

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
  const [farmId, setFarmId] = useState<string | null>(null);
  useEffect(() => {
    const api = supabase();
    if (!api) return;
    void api.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = api.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setFarmId(null);
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
    const { data, error } = await api.from('player_farms').select('id').eq('owner_id', user.id).maybeSingle();
    setFarmId(data?.id ?? null);
    setMessage(error ? 'Không thể tải nông trại online.' : data ? 'Đã xác minh nông trại thuộc tài khoản (chỉ đọc).' : 'Chưa có nông trại online. Dữ liệu offline không bị ảnh hưởng.');
    setBusy(false);
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
        <div className="account-actions"><button type="button" disabled={busy} onClick={() => void readFarm()}>Kiểm tra nông trại online</button><button type="button" disabled={busy} onClick={() => void logout()}>Đăng xuất</button></div>
        {farmId && <small>Mã nông trại online: {farmId}</small>}
      </div> :
      <div><strong>👤 Khách offline</strong> · Đăng nhập online bằng email (thử nghiệm)
        <div className="account-actions"><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" aria-label="Email đăng nhập" /><button type="button" disabled={busy || !email.trim()} onClick={() => void sendLink()}>Gửi liên kết đăng nhập</button></div>
      </div>}
    {message && <p role="status">{message}</p>}
    <small>Chơi và lưu offline vẫn độc lập. Chưa đồng bộ vàng, kho hoặc tiến độ lên máy chủ.</small>
  </div>;
}
