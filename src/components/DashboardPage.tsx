'use client';

import { Order } from '@/lib/types';
import { rp, payBadge, ordBadge } from '@/lib/utils';

interface Props {
  orders: Order[];
  onOpenOrder: (id: string) => void;
  onGoOrders: () => void;
}

export default function DashboardPage({ orders, onOpenOrder, onGoOrders }: Props) {
  const O = orders;
  const omzet = O.reduce((s, o) => s + o.totalAmount, 0);
  const profit = O.reduce((s, o) => s + o.totalFee, 0);
  const piutang = O.reduce((s, o) => s + o.remainingAmount, 0);
  const waitDP = O.filter(o => o.paymentStatus === 'Menunggu DP').length;
  const waitPay = O.filter(o => o.paymentStatus === 'Menunggu Pelunasan').length;
  const inProcess = O.filter(o => ['Menunggu Pembelian', 'Sudah Dibeli'].includes(o.orderStatus)).length;
  const done = O.filter(o => o.orderStatus === 'Selesai').length;

  return (
    <>
      {/* Hero — omzet & profit */}
      <div className="md:hidden rounded-2xl p-5 text-white mb-3" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10.5px] opacity-75 font-semibold uppercase tracking-wide">Total Omzet</div>
            <div className="text-[28px] font-extrabold tracking-tight mt-1">{rp(omzet)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] opacity-75 font-semibold uppercase tracking-wide">Profit</div>
            <div className="text-[20px] font-extrabold tracking-tight mt-1">{rp(profit)}</div>
          </div>
        </div>
        <div className="h-px bg-white/20 my-3" />
        <div className="flex justify-between text-[12px]">
          <div><span className="opacity-70">Piutang </span><span className="font-bold">{rp(piutang)}</span></div>
          <div><span className="opacity-70">Order </span><span className="font-bold">{O.length}</span></div>
        </div>
      </div>

      {/* Desktop hero cards */}
      <div className="hidden md:grid grid-cols-3 gap-3.5 mb-4">
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
          <div className="text-[11px] opacity-80 font-semibold">Total Omzet</div>
          <div className="text-[26px] font-extrabold tracking-tight mt-1">{rp(omzet)}</div>
          <div className="text-[12px] opacity-70 mt-1">{O.length} order</div>
        </div>
        <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #059669, #16a34a)' }}>
          <div className="text-[11px] opacity-80 font-semibold">Estimasi Profit</div>
          <div className="text-[26px] font-extrabold tracking-tight mt-1">{rp(profit)}</div>
          <div className="text-[12px] opacity-70 mt-1">Dari fee jastip</div>
        </div>
        <div className="rounded-2xl p-5 text-white" style={{ background: piutang > 0 ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #059669, #16a34a)' }}>
          <div className="text-[11px] opacity-80 font-semibold">Piutang</div>
          <div className="text-[26px] font-extrabold tracking-tight mt-1">{rp(piutang)}</div>
          <div className="text-[12px] opacity-70 mt-1">Sisa tagihan customer</div>
        </div>
      </div>

      {/* Quick stats — mobile: horizontal scroll, desktop: grid */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1 jp-scroll">
        {[
          { label: 'Menunggu DP', value: waitDP, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Pelunasan', value: waitPay, color: '#f97316', bg: '#fff7ed' },
          { label: 'Diproses', value: inProcess, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Selesai', value: done, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} className="shrink-0 rounded-[12px] py-2.5 px-4 min-w-[90px] text-center" style={{ background: s.bg }}>
            <div className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-semibold mt-[1px]" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Desktop stat cards */}
      <div className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 mb-4">
        {[
          { label: 'Menunggu DP', value: String(waitDP), hint: 'Perlu ditagih', accent: '#f59e0b' },
          { label: 'Menunggu Pelunasan', value: String(waitPay), hint: 'Sebelum kirim', accent: '#f97316' },
          { label: 'Sedang Diproses', value: String(inProcess), hint: 'Pembelian barang', accent: '#3b82f6' },
          { label: 'Order Selesai', value: String(done), hint: 'Bulan ini', accent: '#16a34a' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#eef0f6] rounded-[14px] py-4 px-[18px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: s.accent }} />
            <div className="text-xs text-[#64748b] font-semibold">{s.label}</div>
            <div className="text-[22px] font-extrabold mt-1 tracking-tight">{s.value}</div>
            <div className="text-[11px] text-[#94a3b8] mt-[2px]">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Order terbaru */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-[18px] border-b border-[#f1f5f9]">
          <h2 className="m-0 text-[14px] md:text-[15px] font-bold">Order Terbaru</h2>
          <a onClick={onGoOrders} className="text-[#4f46e5] text-[12px] md:text-[12.5px] font-semibold cursor-pointer no-underline">Lihat semua →</a>
        </div>

        {/* Desktop: tabel */}
        <div className="hidden md:block jp-scroll overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#fafbfd]">
                <th className="text-left py-[11px] px-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Invoice</th>
                <th className="text-left py-[11px] px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Customer</th>
                <th className="text-left py-[11px] px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Batch</th>
                <th className="text-right py-[11px] px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Total</th>
                <th className="text-left py-[11px] px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Bayar</th>
                <th className="text-left py-[11px] px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Order</th>
                <th className="py-[11px] px-5"></th>
              </tr>
            </thead>
            <tbody>
              {O.slice(0, 5).map(o => {
                const [pBg, pC] = payBadge(o.paymentStatus);
                const [oBg, oC] = ordBadge(o.orderStatus);
                return (
                  <tr key={o.orderId} className="border-t border-[#f1f5f9] cursor-pointer hover:bg-[#fafbff] transition-colors" onClick={() => onOpenOrder(o.orderId)}>
                    <td className="py-[13px] px-5 text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</td>
                    <td className="py-[13px] px-4 text-[13px] font-semibold">{o.customerName}</td>
                    <td className="py-[13px] px-4 text-[12.5px] text-[#64748b]">{o.batchName.replace('Jastip ', '')}</td>
                    <td className="py-[13px] px-4 text-[13px] font-bold text-right whitespace-nowrap">{rp(o.totalAmount)}</td>
                    <td className="py-[13px] px-4"><span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span></td>
                    <td className="py-[13px] px-4"><span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: oBg, color: oC }}>{o.orderStatus}</span></td>
                    <td className="py-[13px] px-5 text-right"><span className="text-[#4f46e5] text-[12.5px] font-semibold">Detail →</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden">
          {O.length === 0 && (
            <div className="py-10 text-center">
              <div className="text-[32px] mb-2">📦</div>
              <div className="text-[14px] font-bold text-[#475569]">Belum ada order</div>
              <div className="text-[12px] text-[#94a3b8] mt-1">Klik &quot;Buat Order&quot; untuk mulai</div>
            </div>
          )}
          {O.slice(0, 5).map(o => {
            const [pBg, pC] = payBadge(o.paymentStatus);
            const [oBg, oC] = ordBadge(o.orderStatus);
            return (
              <div key={o.orderId} onClick={() => onOpenOrder(o.orderId)} className="px-4 py-3.5 border-t border-[#f1f5f9] cursor-pointer active:bg-[#f8fafc] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</span>
                    </div>
                    <div className="text-[13.5px] font-semibold mt-[2px]">{o.customerName}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-[2px]">{o.batchName.replace('Jastip ', '')} · {o.items.length} produk</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] font-bold">{rp(o.totalAmount)}</div>
                    {o.remainingAmount > 0 && <div className="text-[10.5px] text-[#d97706] font-semibold mt-[2px]">Sisa {rp(o.remainingAmount)}</div>}
                    {o.remainingAmount <= 0 && o.paidAmount > 0 && <div className="text-[10.5px] text-[#16a34a] font-semibold mt-[2px]">Lunas</div>}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                  <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
