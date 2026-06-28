'use client';

import { Order, Batch } from '@/lib/types';
import { rp, payBadge, ordBadge } from '@/lib/utils';
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
  const paid = O.reduce((s, o) => s + o.paidAmount, 0);
  const lunas = O.filter(o => o.paymentStatus === 'Lunas').length;
  const belumLunas = O.filter(o => o.paymentStatus !== 'Lunas' && o.paymentStatus !== 'Refund').length;

  return (
    <>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden flex flex-col gap-3">

        {/* Hero — glassmorphism */}
        <div className="relative rounded-[18px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)' }}>
          <div className="absolute top-[-30px] right-[-30px] w-[110px] h-[110px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="absolute bottom-[-15px] left-[-15px] w-[70px] h-[70px] rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="relative p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">Laporan Keuangan</div>
              <button onClick={async () => { try { await exportReportExcel(O); onToast('Laporan Excel diunduh ✓'); } catch { onToast('Gagal membuat Excel'); } }} className="py-1.5 px-3 border border-white/25 rounded-[8px] bg-white/10 text-white text-[11px] font-bold cursor-pointer">Export Excel</button>
            </div>
            <div className="text-white text-[28px] font-extrabold tracking-tight leading-none">{rp(omzet)}</div>
            <div className="text-white/50 text-[11px] mt-1">{O.length} order · {lunas} lunas · {belumLunas} belum lunas</div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <div className="rounded-[11px] py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="text-white/55 text-[9.5px] font-semibold uppercase tracking-wide">Profit</div>
                <div className="text-white text-[16px] font-extrabold mt-[2px]">{rp(profit)}</div>
              </div>
              <div className="rounded-[11px] py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="text-white/55 text-[9.5px] font-semibold uppercase tracking-wide">Dibayar</div>
                <div className="text-white text-[16px] font-extrabold mt-[2px]">{rp(paid)}</div>
              </div>
            </div>

            {piutang > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-[9px] py-2 px-3" style={{ background: 'rgba(239,68,68,0.2)' }}>
                <div className="w-2 h-2 rounded-full bg-[#fca5a5] animate-pulse-soft" />
                <span className="text-[11px] text-[#fca5a5] font-semibold">Piutang {rp(piutang)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stat ring cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Modal', value: rp(modal), color: '#475569' },
            { label: 'Fee', value: rp(profit), color: '#16a34a' },
            { label: 'Lunas', value: `${lunas}/${O.length}`, color: '#4f46e5' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#eef0f6] rounded-[12px] py-3 px-2.5 text-center">
              <div className="text-[15px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-[#94a3b8] font-semibold mt-[2px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3 flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[100px]"><label className={lblSmCls}>Dari</label><input type="date" defaultValue="2026-06-01" className={inpSmCls} /></div>
          <div className="flex-1 min-w-[100px]"><label className={lblSmCls}>Sampai</label><input type="date" defaultValue="2026-06-30" className={inpSmCls} /></div>
          <div className="w-full"><label className={lblSmCls}>Batch</label><select className={inpSmCls}><option>Semua batch</option>{batches.map(b => <option key={b.id}>{b.name}</option>)}</select></div>
        </div>

        {/* Detail per order */}
        <div>
          <div className="text-[14px] font-bold mb-2">Detail Per Order</div>
          {O.length === 0 && (
            <div className="bg-white border border-[#eef0f6] rounded-[14px] py-10 text-center">
              <div className="w-[48px] h-[48px] mx-auto rounded-full bg-[#f5f3ff] flex items-center justify-center text-[22px] mb-2">📊</div>
              <div className="text-[13px] font-bold text-[#475569]">Belum ada data</div>
              <div className="text-[11px] text-[#94a3b8] mt-1">Buat order untuk melihat laporan</div>
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {O.map(o => {
              const [pBg, pC] = payBadge(o.paymentStatus);
              const [oBg, oC] = ordBadge(o.orderStatus);
              return (
                <div key={o.orderId} className="bg-white border border-[#eef0f6] rounded-[13px] overflow-hidden">
                  <div className="h-[3px]" style={{ background: o.paymentStatus === 'Lunas' ? '#16a34a' : o.remainingAmount > 0 ? '#f59e0b' : '#6366f1' }} />
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[30px] h-[30px] rounded-[8px] bg-[#f5f3ff] text-[#4f46e5] flex items-center justify-center text-[12px] font-extrabold shrink-0">{o.customerName[0]}</div>
                        <div>
                          <div className="text-[13px] font-semibold leading-tight">{o.customerName}</div>
                          <div className="text-[10.5px] text-[#94a3b8]">{o.invoiceNo}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <span className="py-[2px] px-[6px] rounded-[5px] text-[9px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] rounded-[10px] p-2.5">
                      <div className="text-center">
                        <div className="text-[10px] text-[#94a3b8]">Total</div>
                        <div className="text-[12px] font-bold mt-[1px]">{rp(o.totalAmount)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-[#94a3b8]">Profit</div>
                        <div className="text-[12px] font-bold text-[#16a34a] mt-[1px]">{rp(o.totalFee)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-[#94a3b8]">Sisa</div>
                        <div className="text-[12px] font-bold mt-[1px]" style={{ color: o.remainingAmount > 0 ? '#d97706' : '#16a34a' }}>{o.remainingAmount > 0 ? rp(o.remainingAmount) : 'Lunas'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        <div className="rounded-2xl p-6 text-white mb-4" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs opacity-80 font-semibold uppercase tracking-wide">Total Omzet</div>
              <div className="text-[32px] font-extrabold tracking-tight mt-1">{rp(omzet)}</div>
              <div className="text-[12px] opacity-70 mt-1">{O.length} order · {lunas} lunas · {belumLunas} belum lunas</div>
            </div>
            <button onClick={async () => { try { await exportReportExcel(O); onToast('Laporan Excel diunduh ✓'); } catch { onToast('Gagal membuat Excel'); } }} className="py-2.5 px-4 border border-white/30 rounded-[10px] bg-white/15 text-white text-[12.5px] font-bold cursor-pointer hover:bg-white/25 transition-colors">Export Excel</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 mb-4">
          <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4">
            <div className="text-xs text-[#94a3b8] font-semibold">Modal Barang</div>
            <div className="text-[22px] font-extrabold mt-1">{rp(modal)}</div>
          </div>
          <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#16a34a]" />
            <div className="text-xs text-[#94a3b8] font-semibold">Estimasi Profit</div>
            <div className="text-[22px] font-extrabold text-[#16a34a] mt-1">{rp(profit)}</div>
          </div>
          <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#dc2626]" />
            <div className="text-xs text-[#94a3b8] font-semibold">Piutang</div>
            <div className="text-[22px] font-extrabold text-[#dc2626] mt-1">{rp(piutang)}</div>
          </div>
        </div>

        <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 mb-4 flex gap-2.5 flex-wrap items-end">
          <div className="flex-1 min-w-[120px]"><label className={lblSmCls}>Dari</label><input type="date" defaultValue="2026-06-01" className={inpSmCls} /></div>
          <div className="flex-1 min-w-[120px]"><label className={lblSmCls}>Sampai</label><input type="date" defaultValue="2026-06-30" className={inpSmCls} /></div>
          <div className="flex-1 min-w-[140px]"><label className={lblSmCls}>Batch</label><select className={inpSmCls}><option>Semua batch</option>{batches.map(b => <option key={b.id}>{b.name}</option>)}</select></div>
        </div>

        <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
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
          {O.length === 0 && <div className="py-10 text-center text-[#94a3b8] text-[13px]">Belum ada data order.</div>}
        </div>
      </div>
    </>
  );
}
