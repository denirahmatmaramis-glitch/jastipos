'use client';

import { useState } from 'react';
import { Plan, UpgradeStatus } from '@/lib/types';
import { FREE_ORDER_LIMIT, PRO_PRICE } from '@/lib/store';
import { rp, copyText } from '@/lib/utils';

interface Props {
  plan: Plan;
  orderCount: number;
  upgradeStatus: UpgradeStatus;
  upgradeCode: string;
  bankInfo: string;
  proStartDate?: string;
  proEndDate?: string;
  onConfirmTransfer: (senderName: string, amount: number) => void;
  onToast: (m: string) => void;
}

const NOW = Date.now();

const proFeatures = [
  'Order tak terbatas (lepas dari batas 10 order)',
  'Semua fitur tetap terbuka: laporan, export, template, setting fee',
  'Prioritas dukungan & update fitur baru',
];

export default function UpgradePage({ plan, orderCount, upgradeStatus, upgradeCode, bankInfo, proStartDate, proEndDate, onConfirmTransfer, onToast }: Props) {
  const [senderName, setSenderName] = useState('');
  const uniqueNominal = PRO_PRICE - (PRO_PRICE % 1000) + Number(upgradeCode);

  const fmtDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (plan === 'pro') {
    const daysLeft = proEndDate ? Math.ceil((new Date(proEndDate).getTime() - NOW) / 86400000) : null;
    const isExpiringSoon = daysLeft !== null && daysLeft <= 7;
    return (
      <div className="max-w-[520px]">
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-8 text-center">
          <div className="text-[44px] mb-2">🎉</div>
          <h2 className="m-0 text-[19px] font-extrabold">Kamu sudah Pro!</h2>
          <p className="mt-2 mb-5 text-[#64748b] text-[13.5px]">Semua fitur terbuka dan order kamu tak terbatas. Terima kasih sudah upgrade.</p>
          {(proStartDate || proEndDate) && (
            <div className={`rounded-[14px] border p-4 text-left ${isExpiringSoon ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
              <div className="grid grid-cols-2 gap-y-2 text-[13px]">
                <span className="text-[#94a3b8] font-medium">Mulai berlangganan</span>
                <span className="font-semibold text-[#1e293b]">{fmtDate(proStartDate)}</span>
                <span className="text-[#94a3b8] font-medium">Berakhir</span>
                <span className={`font-semibold ${isExpiringSoon ? 'text-[#b45309]' : 'text-[#1e293b]'}`}>{fmtDate(proEndDate)}</span>
                {daysLeft !== null && (
                  <>
                    <span className="text-[#94a3b8] font-medium">Sisa</span>
                    <span className={`font-semibold ${isExpiringSoon ? 'text-[#b45309]' : 'text-[#16a34a]'}`}>
                      {daysLeft <= 0 ? 'Sudah berakhir' : `${daysLeft} hari`}
                    </span>
                  </>
                )}
              </div>
              {isExpiringSoon && daysLeft !== null && daysLeft > 0 && (
                <div className="mt-2.5 text-[12px] text-[#92400e]">⚠️ Perpanjang langganan kamu agar tidak balik ke Free.</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const lblCls = "block text-xs font-semibold text-[#475569] mb-1.5";
  const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_340px] max-md:grid-cols-1 gap-[18px] items-start">
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full py-1 px-3 text-[11px] font-bold mb-3">JASTIPOS PRO</div>
          <div className="flex items-end gap-1.5">
            <span className="text-[34px] font-extrabold tracking-tight leading-none">{rp(PRO_PRICE)}</span>
            <span className="text-[14px] opacity-85 mb-1">/ bulan</span>
          </div>
          <div className="h-px bg-white/20 my-4" />
          <div className="flex flex-col gap-2.5">
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13.5px]">
                <span className="shrink-0 w-[18px] h-[18px] rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold mt-px">&#10003;</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[14px] p-4 text-[12.5px] text-[#92400e] leading-relaxed">
          <b>Status kamu sekarang:</b> Paket Gratis — sudah memakai <b>{Math.min(orderCount, FREE_ORDER_LIMIT)} dari {FREE_ORDER_LIMIT} order</b>.
          {orderCount >= FREE_ORDER_LIMIT
            ? ' Batas order gratis sudah tercapai. Upgrade ke Pro untuk membuat order baru.'
            : ` Sisa ${FREE_ORDER_LIMIT - orderCount} order lagi sebelum harus upgrade.`}
        </div>
      </div>

      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
        <h3 className="m-0 text-[15px] font-bold">Pembayaran (Transfer Manual)</h3>
        <p className="mt-1 mb-4 text-[#64748b] text-[12.5px] leading-relaxed">Transfer sesuai nominal unik di bawah, lalu isi nama pengirim dan klik konfirmasi.</p>

        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
          <div className="text-[11.5px] text-[#94a3b8] font-semibold">Total transfer (nominal unik)</div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[22px] font-extrabold text-[#4f46e5] tracking-tight">{rp(uniqueNominal)}</span>
            <button onClick={() => { copyText(String(uniqueNominal)); onToast('Nominal disalin ✓'); }} className="border border-[#e2e8f0] bg-white text-[#475569] rounded-lg py-1.5 px-2.5 cursor-pointer text-[11.5px] font-semibold hover:border-[#c7d2fe] transition-colors">Salin</button>
          </div>
          <div className="text-[11px] text-[#94a3b8] mt-1">3 digit terakhir (<b>{upgradeCode}</b>) adalah kode unikmu — jangan dibulatkan.</div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5">
          <div>
            <div className="text-[11.5px] text-[#94a3b8] font-semibold">Rekening tujuan</div>
            <div className="text-[13px] font-bold mt-0.5">{bankInfo || 'Belum diatur'}</div>
          </div>
          {bankInfo && <button onClick={() => { copyText(bankInfo); onToast('Rekening disalin ✓'); }} className="border border-[#e2e8f0] bg-white text-[#475569] rounded-lg py-1.5 px-2.5 cursor-pointer text-[11.5px] font-semibold hover:border-[#c7d2fe] transition-colors shrink-0">Salin</button>}
        </div>

        {upgradeStatus === 'pending' ? (
          <div className="mt-4 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 text-center">
            <div className="text-[13px] font-bold text-[#047857]">Menunggu verifikasi admin</div>
            <div className="text-[12px] text-[#059669] mt-1 leading-relaxed">Konfirmasi transfer terkirim. Akun kamu akan diaktifkan ke Pro setelah admin memverifikasi (&lt; 1x24 jam).</div>
          </div>
        ) : (
          <div className="mt-4">
            <label className={lblCls}>Nama Pengirim <span className="text-[#ef4444]">*</span></label>
            <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Nama sesuai rekening pengirim" className={inpCls} />
            <button onClick={() => {
              if (!senderName.trim()) { onToast('Isi nama pengirim'); return; }
              onConfirmTransfer(senderName.trim(), uniqueNominal);
            }} className="mt-3 w-full py-3 border-none rounded-xl bg-[#16a34a] text-white text-[14px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">Saya sudah transfer</button>
          </div>
        )}
      </div>
    </div>
  );
}
