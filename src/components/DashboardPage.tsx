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
  const paid = O.reduce((s, o) => s + o.paidAmount, 0);
  const waitDP = O.filter(o => o.paymentStatus === 'Menunggu DP').length;
  const waitPay = O.filter(o => o.paymentStatus === 'Menunggu Pelunasan').length;
  const inProcess = O.filter(o => ['Menunggu Pembelian', 'Sudah Dibeli'].includes(o.orderStatus)).length;
  const done = O.filter(o => o.orderStatus === 'Selesai').length;

  return (
    <>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden flex flex-col gap-3">

        {/* Hero omzet — glassmorphism inspired */}
        <div className="relative rounded-[18px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)' }}>
          <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute bottom-[-20px] left-[-20px] w-[80px] h-[80px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="relative p-5 pb-4">
            <div className="text-white/60 text-[10.5px] font-semibold uppercase tracking-widest">Total Omzet</div>
            <div className="text-white text-[30px] font-extrabold tracking-tight mt-1 leading-none">{rp(omzet)}</div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 rounded-[12px] py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <div className="text-white/60 text-[9.5px] font-semibold uppercase tracking-wide">Profit</div>
                <div className="text-white text-[17px] font-extrabold mt-[2px]">{rp(profit)}</div>
              </div>
              <div className="flex-1 rounded-[12px] py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <div className="text-white/60 text-[9.5px] font-semibold uppercase tracking-wide">Dibayar</div>
                <div className="text-white text-[17px] font-extrabold mt-[2px]">{rp(paid)}</div>
              </div>
            </div>
            {piutang > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-[10px] py-2 px-3" style={{ background: 'rgba(239,68,68,0.2)' }}>
                <div className="w-2 h-2 rounded-full bg-[#fca5a5] animate-pulse-soft" />
                <span className="text-[11px] text-[#fca5a5] font-semibold">Piutang {rp(piutang)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status ring cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'DP', value: waitDP, color: '#f59e0b', bg: '#fffbeb', ring: '#fde68a' },
            { label: 'Bayar', value: waitPay, color: '#f97316', bg: '#fff7ed', ring: '#fed7aa' },
            { label: 'Proses', value: inProcess, color: '#3b82f6', bg: '#eff6ff', ring: '#bfdbfe' },
            { label: 'Selesai', value: done, color: '#16a34a', bg: '#f0fdf4', ring: '#bbf7d0' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center py-3 rounded-[14px]" style={{ background: s.bg }}>
              <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[18px] font-extrabold" style={{ color: s.color, border: `3px solid ${s.ring}`, background: '#fff' }}>
                {s.value}
              </div>
              <div className="text-[10px] font-bold mt-1.5" style={{ color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick info bar */}
        <div className="flex items-center justify-between bg-white border border-[#eef0f6] rounded-[13px] py-2.5 px-4">
          <div className="text-[12px] text-[#64748b]"><span className="font-bold text-[#0f172a]">{O.length}</span> total order</div>
          <div className="h-4 w-px bg-[#e2e8f0]" />
          <div className="text-[12px] text-[#64748b]"><span className="font-bold text-[#16a34a]">{done}</span> selesai</div>
          <div className="h-4 w-px bg-[#e2e8f0]" />
          <div className="text-[12px] text-[#64748b]"><span className="font-bold text-[#4f46e5]">{O.length - done}</span> aktif</div>
        </div>

        {/* Order terbaru */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="m-0 text-[15px] font-bold">Order Terbaru</h2>
            <a onClick={onGoOrders} className="text-[#4f46e5] text-[12px] font-semibold cursor-pointer no-underline">Semua →</a>
          </div>

          {O.length === 0 && (
            <div className="bg-white border border-[#eef0f6] rounded-[14px] py-12 text-center">
              <div className="w-[56px] h-[56px] mx-auto rounded-full bg-[#f5f3ff] flex items-center justify-center text-[24px] mb-3">📦</div>
              <div className="text-[14px] font-bold text-[#475569]">Belum ada order</div>
              <div className="text-[12px] text-[#94a3b8] mt-1">Mulai dengan membuat order pertama</div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {O.slice(0, 5).map((o, idx) => {
              const [pBg, pC] = payBadge(o.paymentStatus);
              const [oBg, oC] = ordBadge(o.orderStatus);
              return (
                <div key={o.orderId} onClick={() => onOpenOrder(o.orderId)} className="bg-white border border-[#eef0f6] rounded-[14px] p-3.5 cursor-pointer active:scale-[0.98] transition-transform" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-[28px] h-[28px] rounded-[8px] bg-[#f5f3ff] text-[#4f46e5] flex items-center justify-center text-[11px] font-extrabold shrink-0">
                          {o.customerName[0]}
                        </div>
                        <div>
                          <div className="text-[13.5px] font-semibold leading-tight">{o.customerName}</div>
                          <div className="text-[11px] text-[#94a3b8]">{o.invoiceNo}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[14px] font-bold">{rp(o.totalAmount)}</div>
                      {o.remainingAmount > 0 ? (
                        <div className="text-[10px] text-[#d97706] font-semibold">Sisa {rp(o.remainingAmount)}</div>
                      ) : o.paidAmount > 0 ? (
                        <div className="text-[10px] text-[#16a34a] font-semibold">Lunas</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#f5f6fb]">
                    <div className="flex gap-1.5">
                      <span className="py-[2.5px] px-[7px] rounded-[6px] text-[9.5px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                      <span className="py-[2.5px] px-[7px] rounded-[6px] text-[9.5px] font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">{o.items.length} produk</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        {/* Desktop hero cards */}
        <div className="grid grid-cols-3 gap-3.5 mb-4">
          <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }}>
            <div className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
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

        {/* Desktop stat cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 mb-4">
          {[
            { label: 'Menunggu DP', value: String(waitDP), hint: 'Perlu ditagih', accent: '#f59e0b' },
            { label: 'Menunggu Pelunasan', value: String(waitPay), hint: 'Sebelum kirim', accent: '#f97316' },
            { label: 'Sedang Diproses', value: String(inProcess), hint: 'Pembelian barang', accent: '#3b82f6' },
            { label: 'Order Selesai', value: String(done), hint: 'Bulan ini', accent: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#eef0f6] rounded-[14px] py-4 px-[18px] relative overflow-hidden card-hover">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: s.accent }} />
              <div className="text-xs text-[#64748b] font-semibold">{s.label}</div>
              <div className="text-[22px] font-extrabold mt-1 tracking-tight">{s.value}</div>
              <div className="text-[11px] text-[#94a3b8] mt-[2px]">{s.hint}</div>
            </div>
          ))}
        </div>

        {/* Desktop order table */}
        <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-[#f1f5f9]">
            <h2 className="m-0 text-[15px] font-bold">Order Terbaru</h2>
            <a onClick={onGoOrders} className="text-[#4f46e5] text-[12.5px] font-semibold cursor-pointer no-underline">Lihat semua →</a>
          </div>
          <div className="jp-scroll overflow-x-auto">
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
          {O.length === 0 && <div className="py-10 text-center text-[#94a3b8] text-[13px]">Belum ada order.</div>}
        </div>
      </div>
    </>
  );
}
