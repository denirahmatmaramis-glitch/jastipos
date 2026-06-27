'use client';

import { Order, Batch } from '@/lib/types';
import { rp, dt, buildSteps, maskName } from '@/lib/utils';
import { LogoIcon } from '@/lib/icons';

interface Props {
  order: Order;
  batches: Batch[];
  authed: boolean;
  storeName: string;
  onBack: () => void;
}

export default function TrackPage({ order: o, batches, authed, storeName, onBack }: Props) {
  const batch = batches.find(b => b.id === o.batchId);
  const steps = buildSteps(o.orderStatus);

  return (
    <div className="min-h-screen bg-[#eef0f7] pb-10 animate-fadein">
      {authed && (
        <div className="fixed top-3.5 left-3.5 z-20">
          <button onClick={onBack} className="flex items-center gap-1.5 py-2 px-[13px] border border-[#e2e8f0] rounded-[10px] bg-white text-[12.5px] font-semibold text-[#475569] cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,.08)]">← Kembali ke admin</button>
        </div>
      )}
      <div className="max-w-[440px] mx-auto px-4">
        <div className="pt-[34px] pb-[22px] text-center">
          <div className="inline-flex items-center gap-[9px]">
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
              <LogoIcon size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">{storeName}</span>
          </div>
          <p className="mt-2.5 mb-0 text-[#64748b] text-[12.5px]">Halaman status order · {o.invoiceNo}</p>
        </div>

        {/* status card */}
        <div className="rounded-[18px] p-[22px] text-white shadow-[0_16px_36px_rgba(79,70,229,.35)]" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
          <div className="text-xs opacity-85">Status order saat ini</div>
          <div className="text-xl font-extrabold mt-1">{o.orderStatus}</div>
          <div className="flex gap-[18px] mt-[18px]">
            <div><div className="text-[11px] opacity-80">Total order</div><div className="font-bold text-[15px] mt-[2px]">{rp(o.totalAmount)}</div></div>
            <div><div className="text-[11px] opacity-80">Sudah dibayar</div><div className="font-bold text-[15px] mt-[2px]">{rp(o.paidAmount)}</div></div>
            <div><div className="text-[11px] opacity-80">Sisa</div><div className="font-bold text-[15px] mt-[2px]">{rp(o.remainingAmount)}</div></div>
          </div>
        </div>

        {/* timeline */}
        <div className="bg-white rounded-[18px] p-5 mt-3.5 shadow-[0_2px_14px_rgba(15,23,42,.05)]">
          <div className="text-[13px] font-bold mb-4">Perkembangan order</div>
          {steps.map((st, i) => (
            <div key={i} className="flex gap-[13px] items-start">
              <div className="flex flex-col items-center self-stretch">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: st.dotBg, color: st.dotColor, border: `2px solid ${st.dotBorder}` }}>{st.icon}</div>
                {i < steps.length - 1 && <div className="w-[2px] flex-1 min-h-[18px]" style={{ background: st.lineColor }} />}
              </div>
              <div className="pb-3.5"><div className="text-[13.5px] font-semibold" style={{ color: st.textColor }}>{st.label}</div><div className="text-[11.5px] text-[#94a3b8] mt-[1px]">{st.sub}</div></div>
            </div>
          ))}
        </div>

        {/* detail */}
        <div className="bg-white rounded-[18px] p-5 mt-3.5 shadow-[0_2px_14px_rgba(15,23,42,.05)]">
          <div className="text-[13px] font-bold mb-1.5">Detail order</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 text-[13px] mt-2.5">
            <span className="text-[#94a3b8]">Customer</span><span className="font-semibold text-right">{maskName(o.customerName)}</span>
            <span className="text-[#94a3b8]">Batch</span><span className="font-semibold text-right">{o.batchName}</span>
            <span className="text-[#94a3b8]">Estimasi tiba</span><span className="font-semibold text-right">{dt(batch?.arrival || '')}</span>
          </div>
          <div className="h-px bg-[#eef0f7] my-4" />
          <div className="text-[12.5px] font-bold mb-2.5 text-[#475569]">Produk dipesan</div>
          {o.items.map((it, i) => {
            const meta = [it.color !== '-' ? it.color : null, it.size !== '-' ? it.size : null, `Qty ${it.qty}`].filter(Boolean).join(' · ');
            return (
              <div key={i} className="flex justify-between gap-2.5 py-2">
                <div><div className="text-[13px] font-semibold">{it.productName}</div><div className="text-[11.5px] text-[#94a3b8]">{meta}</div></div>
                <div className="text-[13px] font-semibold whitespace-nowrap">{rp(it.priceInIdr * it.qty)}</div>
              </div>
            );
          })}
        </div>

        {/* resi — tampil saat status dikirim/selesai */}
        {(o.orderStatus === 'Dikirim ke Customer' || o.orderStatus === 'Selesai') && (o.courier || o.resi) && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-[18px] p-[18px] mt-3.5">
            <div className="text-[12.5px] font-bold text-[#047857] mb-2">Pengiriman</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[13px]">
              {o.courier && <><span className="text-[#059669]">Kurir</span><span className="font-bold text-right text-[#065f46]">{o.courier}</span></>}
              {o.resi && <><span className="text-[#059669]">No. Resi</span><span className="font-bold text-right text-[#065f46] font-mono">{o.resi}</span></>}
            </div>
          </div>
        )}

        {/* notes */}
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[14px] p-3.5 mt-3.5 text-xs text-[#92400e] leading-relaxed">
          <b>Catatan admin:</b> {o.notes}
        </div>

        <div className="text-center mt-5 text-[#94a3b8] text-[11.5px]">Powered by {storeName} · JastipOS</div>
      </div>
    </div>
  );
}
