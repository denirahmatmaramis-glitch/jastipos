'use client';

import { copyText } from '@/lib/utils';

interface Props {
  onToast: (m: string) => void;
}

const orderTemplate = `Halo Kak, mau ikut jastip ya? 😊
Tolong isi format order di bawah ini:

📋 *FORMAT ORDER JASTIP*

*Data Customer:*
Nama:
No HP/WA:
Alamat lengkap:
Instagram:

*Batch:* [Nama Batch]

*Produk yang dipesan:*
1. Nama produk:
   Brand/Toko:
   Warna:
   Ukuran:
   Jumlah:
   Harga:

2. Nama produk:
   Brand/Toko:
   Warna:
   Ukuran:
   Jumlah:
   Harga:

(tambah produk lain jika ada)

*Catatan:*


Setelah diisi, kirim balik ke sini ya Kak. Nanti kita buatkan invoice-nya 🙏`;

export default function TemplatesPage({ onToast }: Props) {
  return (
    <div className="max-w-[600px]">
      <div className="bg-white border border-[#eef0f6] rounded-[16px] md:rounded-2xl p-4 md:p-5">
        <div className="flex items-center gap-[10px] mb-3">
          <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[18px]" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
            <span className="text-white">📝</span>
          </div>
          <div>
            <div className="text-[15px] font-bold">Format Order WhatsApp</div>
            <div className="text-[11.5px] text-[#94a3b8]">Kirim ke customer untuk diisi — lalu paste balik ke AI Auto-Fill</div>
          </div>
        </div>
        <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[10px] p-3 mb-3 text-[11.5px] text-[#3730a3] leading-relaxed">
          Kirim template ini ke customer via WA. Setelah customer isi &amp; balas, <b>copy-paste balasannya ke &quot;AI Auto-Fill dari Chat&quot;</b> di Buat Order — AI akan otomatis isi semua data.
        </div>
        <pre className="whitespace-pre-wrap font-[inherit] text-[12px] md:text-[12.5px] text-[#475569] bg-[#f8fafc] rounded-[10px] p-3.5 leading-relaxed m-0 max-h-[280px] overflow-auto">{orderTemplate}</pre>
        <div className="flex gap-2 mt-3">
          <button onClick={() => { copyText(orderTemplate); onToast('Template order disalin ✓'); }} className="flex-1 py-2.5 border-none rounded-[10px] bg-[#4f46e5] text-white text-[12.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Copy Template</button>
          <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(orderTemplate)}`, '_blank'); }} className="flex-1 py-2.5 border-none rounded-[10px] bg-[#16a34a] text-white text-[12.5px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">Kirim via WA</button>
        </div>
      </div>
    </div>
  );
}
