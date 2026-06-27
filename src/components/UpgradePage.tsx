'use client';

import { Plan, UpgradeStatus } from '@/lib/types';
import { FREE_ORDER_LIMIT, PRO_PRICE, BANK_INFO } from '@/lib/store';
import { rp, copyText } from '@/lib/utils';

interface Props {
  plan: Plan;
  orderCount: number;
  upgradeStatus: UpgradeStatus;
  upgradeCode: string;
  onConfirmTransfer: () => void;
  onToast: (m: string) => void;
}

const proFeatures = [
  'Order tak terbatas (lepas dari batas 10 order)',
  'Semua fitur tetap terbuka: laporan, export, template, setting fee',
  'Prioritas dukungan & update fitur baru',
];

export default function UpgradePage({ plan, orderCount, upgradeStatus, upgradeCode, onConfirmTransfer, onToast }: Props) {
  // nominal unik = harga + 3 digit kode (mis. 99000 + 347 = 99347) agar mudah dicocokkan
  const uniqueNominal = PRO_PRICE - (PRO_PRICE % 1000) + Number(upgradeCode);

  if (plan === 'pro') {
    return (
      <div className="max-w-[520px]">
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-8 text-center">
          <div className="text-[44px] mb-2">🎉</div>
          <h2 className="m-0 text-[19px] font-extrabold">Kamu sudah Pro!</h2>
          <p className="mt-2 mb-0 text-[#64748b] text-[13.5px]">Semua fitur terbuka dan order kamu tak terbatas. Terima kasih sudah upgrade 🙏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_340px] max-md:grid-cols-1 gap-[18px] items-start">
      {/* left: plan info */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full py-1 px-3 text-[11px] font-bold mb-3">⭐ JASTIPOS PRO</div>
          <div className="flex items-end gap-1.5">
            <span className="text-[34px] font-extrabold tracking-tight leading-none">{rp(PRO_PRICE)}</span>
            <span className="text-[14px] opacity-85 mb-1">/ bulan</span>
          </div>
          <div className="h-px bg-white/20 my-4" />
          <div className="flex flex-col gap-2.5">
            {proFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13.5px]">
                <span className="shrink-0 w-[18px] h-[18px] rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold mt-px">✓</span>
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

      {/* right: payment */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
        <h3 className="m-0 text-[15px] font-bold">Pembayaran (Transfer Manual)</h3>
        <p className="mt-1 mb-4 text-[#64748b] text-[12.5px] leading-relaxed">Transfer sesuai nominal unik di bawah agar pembayaranmu mudah dicocokkan, lalu klik tombol konfirmasi.</p>

        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
          <div className="text-[11.5px] text-[#94a3b8] font-semibold">Total transfer (nominal unik)</div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[22px] font-extrabold text-[#4f46e5] tracking-tight">{rp(uniqueNominal)}</span>
            <button onClick={() => { copyText(String(uniqueNominal)); onToast('Nominal disalin ✓'); }} className="border border-[#e2e8f0] bg-white text-[#475569] rounded-lg py-1.5 px-2.5 cursor-pointer text-[11.5px] font-semibold hover:border-[#c7d2fe] transition-colors">Salin</button>
          </div>
          <div className="text-[11px] text-[#94a3b8] mt-1">3 digit terakhir ({upgradeCode}) adalah kode unikmu — jangan dibulatkan.</div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5">
          <div>
            <div className="text-[11.5px] text-[#94a3b8] font-semibold">Rekening tujuan</div>
            <div className="text-[13px] font-bold mt-0.5">{BANK_INFO}</div>
          </div>
          <button onClick={() => { copyText(BANK_INFO); onToast('Rekening disalin ✓'); }} className="border border-[#e2e8f0] bg-white text-[#475569] rounded-lg py-1.5 px-2.5 cursor-pointer text-[11.5px] font-semibold hover:border-[#c7d2fe] transition-colors shrink-0">Salin</button>
        </div>

        {upgradeStatus === 'pending' ? (
          <div className="mt-4 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 text-center">
            <div className="text-[13px] font-bold text-[#047857]">⏳ Menunggu verifikasi admin</div>
            <div className="text-[12px] text-[#059669] mt-1 leading-relaxed">Konfirmasi transfer terkirim. Akun kamu akan diaktifkan ke Pro setelah admin memverifikasi pembayaran (biasanya &lt; 1×24 jam).</div>
          </div>
        ) : (
          <button onClick={onConfirmTransfer} className="mt-4 w-full py-3 border-none rounded-xl bg-[#16a34a] text-white text-[14px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">✓ Saya sudah transfer</button>
        )}
      </div>
    </div>
  );
}
