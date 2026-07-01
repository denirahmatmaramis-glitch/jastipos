'use client';

import { useState } from 'react';
import * as db from '@/lib/db';
import { supabaseConfigured } from '@/lib/supabase';

interface Props {
  userId: string | null;
  userEmail: string;
  onToast: (m: string) => void;
}

const categories = [
  { value: 'bug', label: '🐛 Laporan Bug', desc: 'Ada fitur yang error atau tidak berjalan?' },
  { value: 'saran', label: '💡 Saran Fitur', desc: 'Ide atau permintaan fitur baru?' },
  { value: 'pertanyaan', label: '❓ Pertanyaan', desc: 'Ada yang ingin kamu tanyakan?' },
  { value: 'lainnya', label: '📝 Lainnya', desc: 'Hal lain yang ingin kamu sampaikan.' },
];

export default function FeedbackPage({ userId, userEmail, onToast }: Props) {
  const [category, setCategory] = useState('saran');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) { onToast('Tulis pesan dulu'); return; }
    if (!supabaseConfigured || !userId) {
      onToast('Feedback terkirim (demo mode) ✓');
      setSent(true);
      return;
    }
    setLoading(true);
    try {
      await db.insertFeedback(userId, userEmail, category, message.trim());
      setSent(true);
    } catch {
      onToast('Gagal mengirim feedback — coba lagi');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-[520px]">
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-10 text-center">
          <div className="text-[52px] mb-3">🙏</div>
          <h2 className="m-0 text-[18px] font-extrabold text-[#0f172a]">Terima kasih!</h2>
          <p className="mt-2 mb-5 text-[#64748b] text-[13.5px] leading-relaxed">
            Feedback kamu sudah terkirim ke admin. Kami akan membaca dan mempertimbangkannya segera.
          </p>
          <button
            onClick={() => { setSent(false); setMessage(''); setCategory('saran'); }}
            className="border border-[#e2e8f0] bg-white text-[#374151] rounded-xl py-2.5 px-5 text-[13.5px] font-semibold cursor-pointer hover:border-[#c7d2fe] transition-colors"
          >
            Kirim feedback lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[620px]">
      {/* Header info */}
      <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[14px] p-4 mb-5 flex gap-3 items-start">
        <span className="text-[20px] shrink-0">💬</span>
        <div className="text-[12.5px] text-[#3730a3] leading-relaxed">
          Punya masukan, pertanyaan, atau menemukan bug? Kirim langsung ke admin JastipOS. Setiap feedback dibaca dan sangat berarti untuk pengembangan aplikasi.
        </div>
      </div>

      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5 md:p-6 flex flex-col gap-5">
        {/* Dari */}
        <div>
          <label className="block text-[11.5px] font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">Dari</label>
          <div className="flex items-center gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              {(userEmail || 'U')[0].toUpperCase()}
            </div>
            <span className="text-[13px] text-[#374151] font-medium">{userEmail || 'User'}</span>
          </div>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-[11.5px] font-semibold text-[#475569] mb-2 uppercase tracking-wide">Kategori</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="text-left p-3 rounded-[12px] border transition-all cursor-pointer"
                style={{
                  borderColor: category === c.value ? '#6366f1' : '#e2e8f0',
                  background: category === c.value ? '#eef2ff' : 'white',
                }}
              >
                <div className="text-[13px] font-semibold text-[#1e293b]">{c.label}</div>
                <div className="text-[11.5px] text-[#94a3b8] mt-0.5 leading-snug">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pesan */}
        <div>
          <label className="block text-[11.5px] font-semibold text-[#475569] mb-1.5 uppercase tracking-wide">
            Pesan <span className="text-[#ef4444]">*</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tulis pesan kamu di sini — semakin detail semakin baik..."
            rows={5}
            className="w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[12px] text-[13.5px] outline-none resize-none leading-relaxed"
            style={{ fontFamily: 'inherit' }}
          />
          <div className="text-[11px] text-[#94a3b8] mt-1 text-right">{message.length} karakter</div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="w-full py-3 border-none rounded-xl bg-[#4f46e5] text-white text-[14px] font-bold cursor-pointer transition-colors disabled:opacity-50 hover:bg-[#4338ca]"
        >
          {loading ? 'Mengirim...' : '✈️ Kirim Feedback'}
        </button>
      </div>
    </div>
  );
}
