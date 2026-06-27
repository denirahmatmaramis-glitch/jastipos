'use client';

import { copyText } from '@/lib/utils';

interface Props {
  onToast: (m: string) => void;
}

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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {tpls.map(([title, icon, iconBg, iconColor, body], i) => (
        <div key={i} className="bg-white border border-[#eef0f6] rounded-2xl p-[18px] flex flex-col">
          <div className="flex items-center gap-[9px] mb-2.5">
            <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[15px]" style={{ background: iconBg, color: iconColor }}>{icon}</div>
            <div className="text-sm font-bold">{title}</div>
          </div>
          <pre className="whitespace-pre-wrap font-[inherit] text-xs text-[#475569] bg-[#f8fafc] rounded-[10px] p-[13px] leading-relaxed m-0 flex-1 max-h-[170px] overflow-auto">{body}</pre>
          <button onClick={() => { copyText(body); onToast('Template disalin ✓'); }} className="mt-3 py-2.5 border border-[#e2e8f0] rounded-[10px] bg-white text-[12.5px] font-bold cursor-pointer hover:border-[#a5b4fc] hover:text-[#4f46e5] transition-colors">📋 Copy Template</button>
        </div>
      ))}
    </div>
  );
}
