'use client';

import { Order } from '@/lib/types';
import { rp, payBadge, ordBadge } from '@/lib/utils';

interface Props {
  orders: Order[];
  filter: string;
  onFilter: (f: string) => void;
  onOpenOrder: (id: string) => void;
}

const chipsDef = ['Semua', 'Menunggu DP', 'Menunggu Pelunasan', 'Sudah Dibeli', 'Dikirim ke Customer', 'Produk Belum Dibeli'];

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
      {/* Filter chips — scrollable */}
      <div className="jp-scroll flex gap-2 mb-4 overflow-x-auto pb-[2px] -mx-1 px-1">
        {chipsDef.map(c => (
          <button key={c} onClick={() => onFilter(c)} className="py-2 px-3.5 rounded-[20px] text-[12px] md:text-[12.5px] font-semibold cursor-pointer whitespace-nowrap transition-colors shrink-0" style={{ border: `1px solid ${c === filter ? '#4f46e5' : '#e2e8f0'}`, background: c === filter ? '#4f46e5' : '#fff', color: c === filter ? '#fff' : '#475569' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Desktop: tabel */}
      <div className="hidden md:block bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
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

      {/* Mobile: card list */}
      <div className="md:hidden flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#eef0f6] rounded-[14px] py-10 text-center">
            <div className="text-[28px] mb-2">📦</div>
            <div className="text-[13px] font-bold text-[#475569]">Belum ada order di status ini</div>
          </div>
        )}
        {filtered.map(o => {
          const [pBg, pC] = payBadge(o.paymentStatus);
          const [oBg, oC] = ordBadge(o.orderStatus);
          const ps = produkStatus(o);
          return (
            <div key={o.orderId} onClick={() => onOpenOrder(o.orderId)} className="bg-white border border-[#eef0f6] rounded-[14px] p-3.5 cursor-pointer active:bg-[#fafbff] transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</div>
                  <div className="text-[13.5px] font-semibold mt-[2px]">{o.customerName}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-[2px]">{o.batchName.replace('Jastip ', '')} · {o.items.length} produk</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[14px] font-bold">{rp(o.totalAmount)}</div>
                  <div className="text-[10.5px] text-[#d97706] font-semibold mt-[2px]">Sisa {rp(o.remainingAmount)}</div>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
                <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold" style={{ background: ps.allBought ? '#dcfce7' : '#fef3c7', color: ps.allBought ? '#15803d' : '#b45309' }}>{ps.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
