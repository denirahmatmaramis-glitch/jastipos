'use client';

import { Order } from '@/lib/types';
import { rp, payBadge, ordBadge } from '@/lib/utils';

interface Props {
  orders: Order[];
  filter: string;
  onFilter: (f: string) => void;
  onOpenOrder: (id: string) => void;
}

const chipsDef: [string, string][] = [
  ['Semua', '📋'],
  ['Menunggu DP', '⏰'],
  ['Menunggu Pelunasan', '💰'],
  ['Sudah Dibeli', '✅'],
  ['Dikirim ke Customer', '🚚'],
  ['Produk Belum Dibeli', '🛒'],
];

function produkStatus(o: Order): { label: string; bought: number; total: number; allBought: boolean } {
  const total = o.items.length;
  const bought = o.items.filter(it => it.purchaseStatus === 'Sudah Dibeli').length;
  const allBought = bought === total;
  return { label: allBought ? 'Semua dibeli' : `${bought}/${total} dibeli`, bought, total, allBought };
}

export default function OrdersPage({ orders, filter, onFilter, onOpenOrder }: Props) {
  const filtered = filter === 'Semua'
    ? orders
    : filter === 'Produk Belum Dibeli'
      ? orders.filter(o => o.items.some(it => it.purchaseStatus === 'Menunggu Pembelian'))
      : orders.filter(o => o.paymentStatus === filter || o.orderStatus === filter);

  return (
    <>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden">
        {/* Filter chips — scrollable with icons */}
        <div className="jp-scroll flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
          {chipsDef.map(([c, icon]) => (
            <button key={c} onClick={() => onFilter(c)} className="flex items-center gap-1.5 py-2 px-3 rounded-full text-[11.5px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-all" style={{ border: `1.5px solid ${c === filter ? '#4f46e5' : '#e2e8f0'}`, background: c === filter ? '#4f46e5' : '#fff', color: c === filter ? '#fff' : '#475569' }}>
              <span className="text-[13px]">{icon}</span>
              {c === 'Semua' ? `Semua (${orders.length})` : c}
            </button>
          ))}
        </div>

        {/* Summary bar */}
        <div className="flex items-center justify-between bg-white border border-[#eef0f6] rounded-[12px] py-2 px-3.5 mb-3 text-[11.5px]">
          <span className="text-[#64748b]">Menampilkan <b className="text-[#0f172a]">{filtered.length}</b> order</span>
          {filter !== 'Semua' && (
            <button onClick={() => onFilter('Semua')} className="text-[#4f46e5] font-semibold bg-transparent border-none cursor-pointer text-[11px] p-0">Reset filter</button>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white border border-[#eef0f6] rounded-[16px] py-12 text-center">
            <div className="w-[56px] h-[56px] mx-auto rounded-full bg-[#f5f3ff] flex items-center justify-center text-[24px] mb-3">📦</div>
            <div className="text-[14px] font-bold text-[#475569]">Tidak ada order</div>
            <div className="text-[12px] text-[#94a3b8] mt-1">{filter !== 'Semua' ? 'Coba filter lain atau reset' : 'Buat order pertama kamu'}</div>
          </div>
        )}

        {/* Order cards */}
        <div className="flex flex-col gap-2.5">
          {filtered.map((o, idx) => {
            const [pBg, pC] = payBadge(o.paymentStatus);
            const [oBg, oC] = ordBadge(o.orderStatus);
            const ps = produkStatus(o);
            return (
              <div key={o.orderId} onClick={() => onOpenOrder(o.orderId)} className="bg-white border border-[#eef0f6] rounded-[14px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform animate-fadein" style={{ animationDelay: `${idx * 30}ms` }}>
                {/* Color accent top */}
                <div className="h-[3px]" style={{ background: o.paymentStatus === 'Lunas' ? '#16a34a' : o.paymentStatus === 'Menunggu DP' ? '#f59e0b' : o.orderStatus === 'Dikirim ke Customer' ? '#3b82f6' : '#6366f1' }} />
                <div className="p-3.5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[14px] font-extrabold shrink-0" style={{ background: '#f5f3ff', color: '#4f46e5' }}>
                      {o.customerName[0]}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[14px] font-semibold leading-tight">{o.customerName}</div>
                          <div className="text-[11px] text-[#94a3b8] mt-[2px]">{o.invoiceNo} · {o.batchName.replace('Jastip ', '')}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[15px] font-bold">{rp(o.totalAmount)}</div>
                        </div>
                      </div>
                      {/* Status row */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="py-[2.5px] px-[7px] rounded-[6px] text-[9.5px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                          <span className="py-[2.5px] px-[7px] rounded-[6px] text-[9.5px] font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
                          <span className="py-[2.5px] px-[7px] rounded-[6px] text-[9.5px] font-bold" style={{ background: ps.allBought ? '#dcfce7' : '#fef3c7', color: ps.allBought ? '#15803d' : '#b45309' }}>{ps.label}</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#c7d2fe] shrink-0"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block">
        <div className="jp-scroll flex gap-2 mb-4 overflow-x-auto pb-[2px]">
          {chipsDef.map(([c]) => (
            <button key={c} onClick={() => onFilter(c)} className="py-2 px-3.5 rounded-[20px] text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors" style={{ border: `1px solid ${c === filter ? '#4f46e5' : '#e2e8f0'}`, background: c === filter ? '#4f46e5' : '#fff', color: c === filter ? '#fff' : '#475569' }}>
              {c}
            </button>
          ))}
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
          <div className="jp-scroll overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-[#fafbfd]">
                  <th className="text-left py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Invoice</th>
                  <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Batch</th>
                  <th className="text-right py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Bayar</th>
                  <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Order</th>
                  <th className="text-center py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Produk</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const [pBg, pC] = payBadge(o.paymentStatus);
                  const [oBg, oC] = ordBadge(o.orderStatus);
                  const ps = produkStatus(o);
                  return (
                    <tr key={o.orderId} className="border-t border-[#f1f5f9] cursor-pointer hover:bg-[#fafbff] transition-colors" onClick={() => onOpenOrder(o.orderId)}>
                      <td className="py-[13px] px-5 text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</td>
                      <td className="py-[13px] px-4 text-[13px] font-semibold">{o.customerName}</td>
                      <td className="py-[13px] px-4 text-[12.5px] text-[#64748b]">{o.batchName.replace('Jastip ', '')}</td>
                      <td className="py-[13px] px-4 text-[13px] font-bold text-right whitespace-nowrap">{rp(o.totalAmount)}</td>
                      <td className="py-[13px] px-4"><span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span></td>
                      <td className="py-[13px] px-4"><span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: oBg, color: oC }}>{o.orderStatus}</span></td>
                      <td className="py-[13px] px-4 text-center"><span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: ps.allBought ? '#dcfce7' : '#fef3c7', color: ps.allBought ? '#15803d' : '#b45309' }}>{ps.label}</span></td>
                      <td className="py-[13px] px-5 text-right"><span className="text-[#4f46e5] text-[12.5px] font-semibold">Detail →</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-[50px] px-5 text-center">
              <div className="text-[34px] mb-2">📦</div>
              <div className="text-sm font-bold">Belum ada order di status ini</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
