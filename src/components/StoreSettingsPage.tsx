'use client';

import { useState } from 'react';

interface Props {
  storeName: string;
  bankInfo: string;
  onSave: (storeName: string, bankInfo: string) => void;
  onToast: (m: string) => void;
}

const lblCls = "block text-xs font-semibold text-[#475569] mb-[5px]";
const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";

export default function StoreSettingsPage({ storeName, bankInfo, onSave, onToast }: Props) {
  const [name, setName] = useState(storeName);
  const [bank, setBank] = useState(bankInfo);

  const save = () => {
    if (!name.trim()) { onToast('Nama toko wajib diisi'); return; }
    if (!bank.trim()) { onToast('Info rekening wajib diisi'); return; }
    onSave(name.trim(), bank.trim());
    onToast('Pengaturan toko disimpan ✓');
  };

  const isNew = !bankInfo;

  return (
    <div className="max-w-[580px]">
      {isNew && (
        <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[14px] p-4 mb-4">
          <div className="text-[15px] font-bold text-[#3730a3] mb-1">Selamat datang di JastipOS! 🎉</div>
          <div className="text-[12.5px] text-[#3730a3] leading-relaxed">Sebelum mulai, isi dulu nama toko dan rekening pembayaran kamu. Data ini akan tampil di invoice dan halaman tracking customer.</div>
        </div>
      )}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5 mb-4">
        <h3 className="m-0 mb-1 text-[15px] font-bold">Identitas Toko</h3>
        <p className="m-0 mb-4 text-[12.5px] text-[#64748b] leading-relaxed">Nama toko dan info rekening ini akan tampil di invoice, halaman tracking customer, dan template WhatsApp.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={lblCls}>Nama Toko Jastip</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="cth. Jastip Korea by Rina" className={inpCls} />
            <p className="m-0 mt-1.5 text-[11.5px] text-[#94a3b8]">Tampil di header invoice, halaman tracking, dan sidebar.</p>
          </div>

          <div>
            <label className={lblCls}>Info Rekening Pembayaran</label>
            <textarea value={bank} onChange={e => setBank(e.target.value)} placeholder="cth. BCA 1234567890 a/n Rina Pratiwi" className={inpCls + ' min-h-[80px] resize-y'} />
            <p className="m-0 mt-1.5 text-[11.5px] text-[#94a3b8]">Tampil di invoice untuk panduan transfer customer. Bisa lebih dari satu rekening — pisahkan dengan baris baru.</p>
          </div>
        </div>

        <button onClick={save} className="mt-4 py-3 px-[18px] border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Pengaturan</button>
      </div>

      {/* Preview */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
        <h3 className="m-0 mb-3 text-[15px] font-bold">Preview Invoice</h3>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-4">
          <div className="flex justify-between items-start border-b-2 border-[#1e1b4b] pb-3 mb-3">
            <div>
              <div className="text-[16px] font-extrabold">{name || 'Nama Toko'}</div>
              <div className="text-[11px] text-[#94a3b8]">Invoice Jastip</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-extrabold text-[#4f46e5]">INV-XXXXXX</div>
              <div className="text-[11px] text-[#94a3b8]">27 Jun 2026</div>
            </div>
          </div>
          <div className="text-[12px] text-[#64748b]">
            <span className="text-[#94a3b8]">Kepada:</span> <b>Customer Name</b>
          </div>
          <div className="h-px bg-[#e2e8f0] my-3" />
          <div className="text-[12px] text-[#475569] leading-relaxed">
            <span className="text-[#94a3b8]">Pembayaran:</span> <b>{bank || 'Info rekening'}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
