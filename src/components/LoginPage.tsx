'use client';

import { useState } from 'react';
import { LogoIcon } from '@/lib/icons';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  error: string;
  loading: boolean;
}

export default function LoginPage({ onLogin, onRegister, error, loading }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [localErr, setLocalErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    if (!email.trim() || !password.trim()) { setLocalErr('Email & password wajib diisi'); return; }
    if (mode === 'register') {
      if (password.length < 6) { setLocalErr('Password minimal 6 karakter'); return; }
      if (password !== confirmPw) { setLocalErr('Password tidak cocok'); return; }
      await onRegister(email.trim(), password);
    } else {
      await onLogin(email.trim(), password);
    }
  };

  const errMsg = localErr || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(120% 120% at 0% 0%, #312e81 0%, #1e1b4b 45%, #0f0d2e 100%)' }}>
      <div className="w-full max-w-[420px] animate-slideup">
        <div className="flex items-center gap-3 justify-center mb-7">
          <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,.45)' }}>
            <LogoIcon size={24} />
          </div>
          <span className="text-white text-2xl font-extrabold tracking-tight">Jastip<span className="text-[#a5b4fc]">OS</span></span>
        </div>
        <div className="bg-white rounded-[20px] p-8 shadow-[0_30px_60px_rgba(15,12,46,.4)]">
          <h1 className="m-0 mb-1 text-[21px] font-extrabold tracking-tight">
            {mode === 'login' ? 'Masuk ke dashboard' : 'Daftar akun baru'}
          </h1>
          <p className="m-0 mb-6 text-[#64748b] text-[13.5px] leading-relaxed">
            {mode === 'login'
              ? 'Kelola order jastip, invoice, pembayaran, dan tracking dalam satu tempat.'
              : 'Buat akun gratis untuk mulai mengelola jastip kamu.'}
          </p>
          <form onSubmit={submit}>
            <label className="block text-[12.5px] font-semibold text-[#475569] mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[11px] text-sm outline-none mb-4" autoFocus />
            <label className="block text-[12.5px] font-semibold text-[#475569] mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[11px] text-sm outline-none mb-4" />
            {mode === 'register' && (
              <>
                <label className="block text-[12.5px] font-semibold text-[#475569] mb-1.5">Konfirmasi Password</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Ketik ulang password" className="w-full py-3 px-3.5 border border-[#e2e8f0] rounded-[11px] text-sm outline-none mb-4" />
              </>
            )}
            {errMsg && (
              <div className="mb-4 p-3 rounded-[10px] bg-[#fef2f2] border border-[#fecaca] text-[12.5px] text-[#b91c1c]">{errMsg}</div>
            )}
            <button type="submit" disabled={loading} className="w-full py-[13px] border-none rounded-[11px] bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[14.5px] font-bold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Memproses...' : (mode === 'login' ? 'Login' : 'Daftar')}
            </button>
          </form>
          <p className="mt-[18px] mb-0 text-center text-[#64748b] text-[12.5px]">
            {mode === 'login' ? (
              <>Belum punya akun? <button onClick={() => { setMode('register'); setLocalErr(''); }} className="bg-transparent border-none text-[#4f46e5] font-bold cursor-pointer p-0">Daftar gratis</button></>
            ) : (
              <>Sudah punya akun? <button onClick={() => { setMode('login'); setLocalErr(''); }} className="bg-transparent border-none text-[#4f46e5] font-bold cursor-pointer p-0">Login</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
