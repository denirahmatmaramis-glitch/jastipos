'use client';

import { useState } from 'react';
import Link from 'next/link';

const features = [
  {
    icon: '📦',
    title: 'Manajemen Order Lengkap',
    desc: 'Buat, edit, dan pantau semua order jastip dalam satu dashboard. Status otomatis terupdate sesuai progres.',
  },
  {
    icon: '💬',
    title: 'Parse Chat WhatsApp AI',
    desc: 'Tempel chat WhatsApp customer, AI langsung parsing jadi form order. Hemat waktu input manual.',
  },
  {
    icon: '🔗',
    title: 'Link Tracking Customer',
    desc: 'Kirim link unik ke customer agar mereka bisa cek status ordernya sendiri. Kurangi pertanyaan "udah sampai mana?"',
  },
  {
    icon: '🧾',
    title: 'Invoice PDF Otomatis',
    desc: 'Generate invoice profesional dengan satu klik. Langsung bisa dikirim ke customer via WhatsApp.',
  },
  {
    icon: '💰',
    title: 'Laporan Keuangan',
    desc: 'Pantau profit, modal, piutang, dan total penjualan. Laporan otomatis berdasarkan semua transaksi.',
  },
  {
    icon: '👥',
    title: 'Database Customer',
    desc: 'Simpan data customer, nomor HP, dan history order. Auto-fill form saat customer repeat order.',
  },
  {
    icon: '⚙️',
    title: 'Setting Fee Jastip',
    desc: 'Atur persentase fee per tier harga, minimum fee, dan kurs mata uang yang fleksibel.',
  },
  {
    icon: '🔒',
    title: 'Data Aman & Terisolasi',
    desc: 'Setiap akun punya data terpisah. Tidak ada jastiper lain yang bisa akses data kamu.',
  },
];

const steps = [
  {
    num: '1',
    title: 'Daftar Gratis',
    desc: 'Buat akun dalam hitungan detik. Langsung bisa pakai semua fitur tanpa kartu kredit.',
    color: '#6366f1',
  },
  {
    num: '2',
    title: 'Input Order',
    desc: 'Buat order manual atau tempel chat WhatsApp — AI akan parsing otomatis jadi form order.',
    color: '#8b5cf6',
  },
  {
    num: '3',
    title: 'Kelola & Kirim',
    desc: 'Pantau status, generate invoice, kirim link tracking ke customer. Semua dalam satu tempat.',
    color: '#06b6d4',
  },
];

const faqs = [
  {
    q: 'Apakah JastipOS gratis?',
    a: 'Ya! Paket Free bisa dipakai selamanya tanpa batas waktu. Upgrade ke Pro untuk fitur lebih lengkap dan tanpa batas order.',
  },
  {
    q: 'Data saya aman?',
    a: 'Data kamu tersimpan di server aman dengan enkripsi. Setiap akun punya data terisolasi — tidak ada akun lain yang bisa melihat data kamu.',
  },
  {
    q: 'Apakah perlu install aplikasi?',
    a: 'Tidak perlu! JastipOS berbasis web, bisa diakses langsung dari browser HP atau laptop. Tampilannya mobile-friendly.',
  },
  {
    q: 'Fitur AI parse chat itu gimana cara kerjanya?',
    a: 'Kamu copy-paste chat order dari WhatsApp, lalu AI akan membaca dan mengisi form order otomatis — nama produk, harga, catatan, dll.',
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15 }}>J</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', letterSpacing: '-0.3px' }}>JastipOS</span>
          </div>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
            <a href="#fitur" style={{ fontSize: 14, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Fitur</a>
            <a href="#cara-kerja" style={{ fontSize: 14, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Cara Kerja</a>
            <a href="#harga" style={{ fontSize: 14, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>Harga</a>
            <a href="#faq" style={{ fontSize: 14, color: '#475569', textDecoration: 'none', fontWeight: 500 }}>FAQ</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/app" style={{ fontSize: 13.5, color: '#475569', fontWeight: 600, textDecoration: 'none', padding: '7px 14px' }} className="hidden-mobile">
              Masuk
            </Link>
            <Link href="/app" style={{ fontSize: 13.5, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '8px 18px', borderRadius: 10 }}>
              Coba Gratis
            </Link>
            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#475569' }} className="show-mobile">
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '12px 20px 16px' }} className="show-mobile">
            <a href="#fitur" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: '#374151', fontWeight: 500, textDecoration: 'none', fontSize: 15, borderBottom: '1px solid #f8fafc' }}>Fitur</a>
            <a href="#cara-kerja" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: '#374151', fontWeight: 500, textDecoration: 'none', fontSize: 15, borderBottom: '1px solid #f8fafc' }}>Cara Kerja</a>
            <a href="#harga" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: '#374151', fontWeight: 500, textDecoration: 'none', fontSize: 15, borderBottom: '1px solid #f8fafc' }}>Harga</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: '#374151', fontWeight: 500, textDecoration: 'none', fontSize: 15 }}>FAQ</a>
            <Link href="/app" style={{ display: 'block', marginTop: 12, textAlign: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '12px', borderRadius: 12, fontSize: 15 }}>
              Coba Gratis — Gratis!
            </Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', color: 'white', padding: '80px 20px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.18)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 100, padding: '5px 14px', fontSize: 12.5, color: '#a5b4fc', fontWeight: 600, marginBottom: 24 }}>
            ✨ Gratis selamanya untuk paket dasar
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 6vw, 58px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-1px' }}>
            Sistem Operasional
            <br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#c084fc,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Jastiper Modern
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Kelola order, invoice, pembayaran, dan tracking pelanggan — semuanya dalam satu aplikasi. Berhenti pakai catatan manual, mulai pakai JastipOS.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '14px 28px', borderRadius: 14, fontSize: 15, boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              Mulai Gratis Sekarang
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#fitur" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, textDecoration: 'none', padding: '14px 24px', borderRadius: 14, fontSize: 15 }}>
              Lihat Fitur
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 4vw, 48px)', marginTop: 56, flexWrap: 'wrap' }}>
            {[['100%', 'Gratis untuk mulai'], ['0', 'Tidak perlu install'], ['AI', 'Parse chat otomatis']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#c7d2fe' }}>{val}</div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section style={{ background: '#fafbff', padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Masih pakai cara lama? 🤦
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
            Banyak jastiper yang masih bergantung pada catatan manual, nota tangan, atau spreadsheet yang ruwet.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { emoji: '😩', text: 'Lupa catat order customer' },
              { emoji: '📝', text: 'Invoice nulis tangan atau edit template manual' },
              { emoji: '📞', text: 'Customer terus tanya "Udah sampai mana?"' },
              { emoji: '💸', text: 'Bingung berapa profit bulan ini' },
              { emoji: '🔢', text: 'Salah hitung fee atau kurs' },
              { emoji: '📱', text: 'Data tercecer di banyak chat & notes' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, padding: '18px 24px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #c7d2fe', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 14, color: '#3730a3', fontWeight: 600 }}>JastipOS menyelesaikan semua masalah ini dalam satu aplikasi.</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="fitur" style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Fitur Lengkap
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Semua yang kamu butuhkan
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              Dari input order sampai laporan keuangan — semuanya terintegrasi dan otomatis.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: '#fafbff', border: '1px solid #e8ecf5', borderRadius: 16, padding: '22px 20px', transition: 'box-shadow 0.15s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1e293b', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="cara-kerja" style={{ padding: '80px 20px', background: 'linear-gradient(160deg,#0f0c29 0%,#1e1b4b 100%)', color: 'white' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Cara Kerja
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 12 }}>
            Mulai dalam 3 langkah
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 52 }}>
            Tidak perlu setup rumit. Langsung pakai.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 22px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'white', marginBottom: 18, boxShadow: `0 8px 24px ${s.color}50` }}>
                  {s.num}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <Link href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 48, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '14px 28px', borderRadius: 14, fontSize: 15, boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
            Mulai Sekarang — Gratis!
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="harga" style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Harga
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Transparan, terjangkau, tanpa kejutan
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 48 }}>
            Mulai gratis, upgrade kalau sudah yakin.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 680, margin: '0 auto' }}>
            {/* Free */}
            <div style={{ border: '2px solid #e2e8f0', borderRadius: 22, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Free</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Rp0</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Selamanya, tanpa kartu kredit</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Manajemen order', 'Invoice PDF', 'Link tracking customer', 'Database customer', 'Laporan keuangan', 'Parse chat AI'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#475569' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#dcfce7"/><path d="M8 12l3 3 5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/app" style={{ display: 'block', textAlign: 'center', border: '2px solid #e2e8f0', color: '#374151', fontWeight: 700, textDecoration: 'none', padding: '12px', borderRadius: 12, fontSize: 14 }}>
                Mulai Gratis
              </Link>
            </div>

            {/* Pro */}
            <div style={{ border: '2px solid #6366f1', borderRadius: 22, padding: '28px 24px', textAlign: 'left', background: 'linear-gradient(160deg,#fafbff,#f5f3ff)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100 }}>
                POPULER
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Pro</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Rp99.000</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>per bulan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {['Semua fitur Free', 'Order & customer tak terbatas', 'Prioritas support', 'Export laporan', 'Multi batch order', 'Update fitur lebih awal'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#475569' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#e0e7ff"/><path d="M8 12l3 3 5-5" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/app" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '12px', borderRadius: 12, fontSize: 14, boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                Upgrade ke Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" style={{ padding: '80px 20px', background: '#fafbff' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              FAQ
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#0f172a' }}>
              Pertanyaan yang sering ditanya
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: '#1e293b' }}>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 13.5, color: '#64748b', lineHeight: 1.7, borderTop: '1px solid #f1f5f9' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(160deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%)', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.2 }}>
            Sudah siap upgrade bisnis jastip kamu?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 36, lineHeight: 1.65 }}>
            Bergabung dengan jastiper yang sudah pakai JastipOS. Daftar gratis, tidak perlu kartu kredit, langsung bisa dipakai.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#4338ca', fontWeight: 800, textDecoration: 'none', padding: '14px 28px', borderRadius: 14, fontSize: 15, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              Daftar Gratis Sekarang
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600, textDecoration: 'none', padding: '14px 22px', borderRadius: 14, fontSize: 15 }}>
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#0f172a', color: '#64748b', padding: '40px 20px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>J</div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#e2e8f0' }}>JastipOS</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', maxWidth: 240, lineHeight: 1.6 }}>
                Sistem operasional lengkap untuk jastiper Indonesia.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Produk</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="#fitur" style={{ fontSize: 13.5, color: '#475569', textDecoration: 'none' }}>Fitur</a>
                  <a href="#harga" style={{ fontSize: 13.5, color: '#475569', textDecoration: 'none' }}>Harga</a>
                  <a href="#cara-kerja" style={{ fontSize: 13.5, color: '#475569', textDecoration: 'none' }}>Cara Kerja</a>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Akun</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/app" style={{ fontSize: 13.5, color: '#475569', textDecoration: 'none' }}>Daftar</Link>
                  <Link href="/app" style={{ fontSize: 13.5, color: '#475569', textDecoration: 'none' }}>Masuk</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, fontSize: 12.5, color: '#334155', textAlign: 'center' }}>
            © 2025 JastipOS. Dibuat dengan ❤️ untuk jastiper Indonesia.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
