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

const tpls: [string, string, string, string, string][] = [
  ['Invoice Order', '🧾', '#eef2ff', '#4f46e5', 'Halo Kak [Nama], berikut invoice order jastip kamu:\n\nInvoice: [InvoiceNo]\nTotal: [Total]\nDP: [DP]\nSisa: [Sisa]\n\nLink status: [Link]'],
  ['Reminder DP', '⏰', '#fef3c7', '#b45309', 'Halo Kak [Nama], jangan lupa transfer DP sebesar [DP] ya untuk mengamankan slot order jastip kamu. Terima kasih 🙏'],
  ['Reminder Pelunasan', '💰', '#ffedd5', '#c2410c', 'Halo Kak [Nama], barang jastip kamu sudah tiba. Sisa pelunasan sebesar [Sisa Pelunasan]. Mohon pelunasan sebelum barang dikirim ya Kak. Terima kasih.'],
  ['Barang Sudah Tiba', '📦', '#dbeafe', '#1d4ed8', 'Halo Kak [Nama], kabar baik! Barang jastip kamu sudah tiba di admin. Setelah pelunasan, barang langsung kami kirim ya 😊'],
  ['Barang Dikirim', '🚚', '#dcfce7', '#15803d', 'Halo Kak [Nama], barang kamu sudah dikirim via [Kurir] dengan resi [Resi]. Cek status: [Link]'],
  ['Order Selesai', '✅', '#dcfce7', '#15803d', 'Halo Kak [Nama], order kamu sudah selesai 🎉 Terima kasih sudah ikut jastip. Ditunggu order berikutnya ya!'],
  ['Cancel / Refund', '↩️', '#fee2e2', '#b91c1c', 'Halo Kak [Nama], order [InvoiceNo] telah dibatalkan. Refund sebesar [Jumlah] akan diproses ke rekening kamu. Mohon konfirmasi nomor rekening.'],
];

export default function TemplatesPage({ onToast }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Template Order — highlight di atas */}
      <div className="bg-white border-2 border-[#4f46e5] rounded-2xl p-4 md:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#4f46e5] text-white text-[10px] font-bold py-1 px-3 rounded-bl-lg">TEMPLATE UTAMA</div>
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

      {/* Template lainnya */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 md:gap-4">
        {tpls.map(([title, icon, iconBg, iconColor, body], i) => (
          <div key={i} className="bg-white border border-[#eef0f6] rounded-2xl p-4 md:p-[18px] flex flex-col">
            <div className="flex items-center gap-[9px] mb-2.5">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[15px]" style={{ background: iconBg, color: iconColor }}>{icon}</div>
              <div className="text-[13.5px] md:text-sm font-bold">{title}</div>
            </div>
            <pre className="whitespace-pre-wrap font-[inherit] text-[11.5px] md:text-xs text-[#475569] bg-[#f8fafc] rounded-[10px] p-[12px] md:p-[13px] leading-relaxed m-0 flex-1 max-h-[170px] overflow-auto">{body}</pre>
            <button onClick={() => { copyText(body); onToast('Template disalin ✓'); }} className="mt-3 py-2.5 border border-[#e2e8f0] rounded-[10px] bg-white text-[12px] md:text-[12.5px] font-bold cursor-pointer hover:border-[#a5b4fc] hover:text-[#4f46e5] transition-colors">Copy Template</button>
          </div>
        ))}
      </div>
    </div>
  );
}
