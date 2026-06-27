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
  return {
    label: allBought ? 'Semua dibeli' : `${bought}/${total} dibeli`,
    bought,
    total,
    allBought,
  };
}

export default function OrdersPage({ orders, filter, onFilter, onOpenOrder }: Props) {
  const filtered = filter === 'Semua'
    ? orders
    : filter === 'Produk Belum Dibeli'
      ? orders.filter(o => o.items.some(it => it.purchaseStatus === 'Menunggu Pembelian'))
      : orders.filter(o => o.paymentStatus === filter || o.orderStatus === filter);

  return (
    <>
      <div className="jp-scroll flex gap-2 mb-4 overflow-x-auto pb-[2px]">
        {chipsDef.map(c => (
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
                    <td className="py-[13px] px-4 text-center">
                      <span className="inline-block py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: ps.allBought ? '#dcfce7' : '#fef3c7', color: ps.allBought ? '#15803d' : '#b45309' }}>
                        {ps.label}
                      </span>
                    </td>
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
    </>
  );
}
