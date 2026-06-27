'use client';

import { Order, Batch } from '@/lib/types';
import { rp, payBadge } from '@/lib/utils';
import { exportReportExcel } from '@/lib/export';

interface Props {
  orders: Order[];
  batches: Batch[];
  onToast: (m: string) => void;
}

const inpSmCls = "w-full py-2 px-2.5 border border-[#e2e8f0] rounded-[9px] text-[13px] outline-none bg-white";
const lblSmCls = "block text-[11.5px] font-semibold text-[#64748b] mb-1";

export default function ReportsPage({ orders, batches, onToast }: Props) {
  const O = orders;
  const omzet = O.reduce((s, o) => s + o.totalAmount, 0);
  const modal = O.reduce((s, o) => s + o.totalProduct, 0);
  const profit = O.reduce((s, o) => s + o.totalFee, 0);
  const piutang = O.reduce((s, o) => s + o.remainingAmount, 0);
  const lunas = O.filter(o => o.paymentStatus === 'Lunas').length;
  const belumLunas = O.filter(o => o.paymentStatus !== 'Lunas' && o.paymentStatus !== 'Refund').length;

  return (
    <>
      {/* Hero summary */}
      <div className="rounded-2xl p-5 md:p-6 text-white mb-4" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] md:text-xs opacity-80 font-semibold uppercase tracking-wide">Total Omzet</div>
            <div className="text-[26px] md:text-[32px] font-extrabold tracking-tight mt-1">{rp(omzet)}</div>
            <div className="text-[12px] opacity-70 mt-1">{O.length} order · {lunas} lunas · {belumLunas} belum lunas</div>
          </div>
          <button onClick={async () => { try { await exportReportExcel(O); onToast('Laporan Excel diunduh ✓'); } catch { onToast('Gagal membuat Excel'); } }} className="py-2.5 px-4 border border-white/30 rounded-[10px] bg-white/15 text-white text-[12.5px] font-bold cursor-pointer hover:bg-white/25 transition-colors backdrop-blur-sm">Export Excel</button>
        </div>
      </div>

      {/* Stat cards — 2x2 mobile, 3x2 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5 mb-4">
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4">
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Total Order</div>
          <div className="text-[20px] md:text-[22px] font-extrabold mt-1">{O.length}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4">
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Modal Barang</div>
          <div className="text-[17px] md:text-[20px] font-extrabold mt-1">{rp(modal)}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#16a34a]" />
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Fee Jastip</div>
          <div className="text-[17px] md:text-[20px] font-extrabold text-[#16a34a] mt-1">{rp(profit)}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#16a34a]" />
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Estimasi Profit</div>
          <div className="text-[17px] md:text-[20px] font-extrabold text-[#16a34a] mt-1">{rp(profit)}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#dc2626]" />
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Piutang</div>
          <div className="text-[17px] md:text-[20px] font-extrabold text-[#dc2626] mt-1">{rp(piutang)}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5 md:p-4">
          <div className="text-[10.5px] md:text-xs text-[#94a3b8] font-semibold">Lunas</div>
          <div className="text-[20px] md:text-[22px] font-extrabold text-[#16a34a] mt-1">{lunas}<span className="text-[13px] text-[#94a3b8] font-semibold">/{O.length}</span></div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-[#eef0f6] rounded-[14px] p-3.5 md:p-4 mb-4 flex gap-2.5 flex-wrap items-end">
        <div className="flex-1 min-w-[120px]"><label className={lblSmCls}>Dari</label><input type="date" defaultValue="2026-06-01" className={inpSmCls} /></div>
        <div className="flex-1 min-w-[120px]"><label className={lblSmCls}>Sampai</label><input type="date" defaultValue="2026-06-30" className={inpSmCls} /></div>
        <div className="flex-1 min-w-[140px]"><label className={lblSmCls}>Batch</label><select className={inpSmCls}><option>Semua batch</option>{batches.map(b => <option key={b.id}>{b.name}</option>)}</select></div>
      </div>

      {/* Detail per order — desktop table */}
      <div className="hidden md:block bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
        <div className="py-3.5 px-5 border-b border-[#f1f5f9] text-[14px] font-bold">Detail Per Order</div>
        <div className="jp-scroll overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#fafbfd]">
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Invoice</th>
                <th className="text-left py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Customer</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Modal</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Fee</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Total</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Dibayar</th>
                <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Sisa</th>
                <th className="text-right py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Profit</th>
              </tr>
            </thead>
            <tbody>
              {O.map(o => (
                <tr key={o.orderId} className="border-t border-[#f1f5f9] hover:bg-[#fafbff] transition-colors">
                  <td className="py-[13px] px-5 text-[12.5px] font-bold text-[#4f46e5]">{o.invoiceNo}</td>
                  <td className="py-[13px] px-3 text-[12.5px] font-semibold">{o.customerName}</td>
                  <td className="py-[13px] px-3 text-right text-[12.5px]">{rp(o.totalProduct)}</td>
                  <td className="py-[13px] px-3 text-right text-[12.5px]">{rp(o.totalFee)}</td>
                  <td className="py-[13px] px-3 text-right text-[12.5px] font-bold">{rp(o.totalAmount)}</td>
                  <td className="py-[13px] px-3 text-right text-[12.5px] text-[#16a34a]">{rp(o.paidAmount)}</td>
                  <td className="py-[13px] px-3 text-right text-[12.5px] text-[#d97706]">{rp(o.remainingAmount)}</td>
                  <td className="py-[13px] px-5 text-right text-[12.5px] font-extrabold text-[#16a34a]">{rp(o.totalFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {O.length === 0 && (
          <div className="py-10 text-center text-[#94a3b8] text-[13px]">Belum ada data order.</div>
        )}
      </div>

      {/* Detail per order — mobile cards */}
      <div className="md:hidden">
        <div className="text-[14px] font-bold mb-2.5">Detail Per Order</div>
        {O.length === 0 && (
          <div className="bg-white border border-[#eef0f6] rounded-[14px] py-10 text-center">
            <div className="text-[28px] mb-2">📊</div>
            <div className="text-[13px] font-bold text-[#475569]">Belum ada data order</div>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {O.map(o => {
            const [pBg, pC] = payBadge(o.paymentStatus);
            return (
              <div key={o.orderId} className="bg-white border border-[#eef0f6] rounded-[14px] p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</div>
                    <div className="text-[13px] font-semibold mt-[2px]">{o.customerName}</div>
                  </div>
                  <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold shrink-0" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] pt-2 border-t border-[#f1f5f9]">
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Modal</span><span className="font-semibold">{rp(o.totalProduct)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Fee</span><span className="font-semibold text-[#16a34a]">{rp(o.totalFee)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Total</span><span className="font-bold">{rp(o.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Dibayar</span><span className="font-semibold text-[#16a34a]">{rp(o.paidAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Sisa</span><span className="font-semibold text-[#d97706]">{rp(o.remainingAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94a3b8]">Profit</span><span className="font-bold text-[#16a34a]">{rp(o.totalFee)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
