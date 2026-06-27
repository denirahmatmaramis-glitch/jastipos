'use client';

import { Plan, UpgradeStatus } from '@/lib/types';
import { PRO_PRICE } from '@/lib/store';
import { rp } from '@/lib/utils';

interface Props {
  plan: Plan;
  upgradeStatus: UpgradeStatus;
  upgradeCode: string;
  onActivate: () => void;
  onResetFree: () => void;
}

export default function AdminPage({ plan, upgradeStatus, upgradeCode, onActivate, onResetFree }: Props) {
  const uniqueNominal = PRO_PRICE - (PRO_PRICE % 1000) + Number(upgradeCode);
  const pending = upgradeStatus === 'pending' && plan === 'free';

  return (
    <div className="max-w-[760px]">
      <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[14px] p-4 mb-4 text-[12.5px] text-[#3730a3] leading-relaxed">
        🛡️ <b>Panel Admin (Owner JastipOS).</b> Halaman ini hanya untuk kamu sebagai pemilik aplikasi — untuk memverifikasi transfer jastiper dan mengaktifkan paket Pro mereka. <i>(Versi demo: menampilkan 1 akun.)</i>
      </div>

      <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <h3 className="m-0 text-[15px] font-bold">Permintaan Upgrade Menunggu Verifikasi</h3>
          <span className="text-[11.5px] font-bold py-1 px-2.5 rounded-full" style={{ background: pending ? '#fef3c7' : '#f1f5f9', color: pending ? '#b45309' : '#94a3b8' }}>{pending ? '1 menunggu' : '0 menunggu'}</span>
        </div>

        {pending ? (
          <div className="flex items-center gap-4 px-5 py-4 max-md:flex-col max-md:items-start">
            <div className="w-10 h-10 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-[15px] shrink-0">O</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold">Owner Jastip</div>
              <div className="text-[12px] text-[#94a3b8]">owner@jastipos.id · nominal {rp(uniqueNominal)} · kode {upgradeCode}</div>
            </div>
            <button onClick={onActivate} className="py-2.5 px-4 border-none rounded-[10px] bg-[#16a34a] text-white text-[13px] font-bold cursor-pointer whitespace-nowrap hover:bg-[#15803d] transition-colors">✓ Aktifkan Pro</button>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="text-[32px] mb-2">📭</div>
            <div className="text-[14px] font-bold">Tidak ada permintaan menunggu</div>
            <div className="text-[12.5px] text-[#94a3b8] mt-1">
              {plan === 'pro' ? 'Akun demo sudah berstatus Pro.' : 'Belum ada jastiper yang mengonfirmasi transfer.'}
            </div>
          </div>
        )}
      </div>

      {/* status + dev reset */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5 mt-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[13px] font-bold">Status akun demo saat ini</div>
          <div className="text-[12px] text-[#94a3b8] mt-0.5">Plan: <b className={plan === 'pro' ? 'text-[#16a34a]' : 'text-[#b45309]'}>{plan === 'pro' ? 'PRO' : 'FREE'}</b> · upgrade: {upgradeStatus}</div>
        </div>
        <button onClick={onResetFree} className="py-2 px-3.5 border border-[#e2e8f0] rounded-[10px] bg-white text-[#475569] text-[12.5px] font-semibold cursor-pointer hover:border-[#c7d2fe] transition-colors">↺ Reset ke Free (demo)</button>
      </div>
    </div>
  );
}
