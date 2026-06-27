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

  const statCards = [
    { label: 'Order bulan ini', value: String(O.length), hint: 'Juni 2026', accent: '#6366f1', valColor: '#0f172a' },
    { label: 'Menunggu DP', value: String(O.filter(o => o.paymentStatus === 'Menunggu DP').length), hint: 'Perlu ditagih', accent: '#f59e0b', valColor: '#0f172a' },
    { label: 'Menunggu Pelunasan', value: String(O.filter(o => o.paymentStatus === 'Menunggu Pelunasan').length), hint: 'Sebelum kirim', accent: '#f97316', valColor: '#0f172a' },
    { label: 'Barang dalam perjalanan', value: String(O.filter(o => ['Dalam Perjalanan ke Admin', 'Sudah Dibeli', 'Menunggu Pembelian'].includes(o.orderStatus)).length), hint: 'Menuju admin', accent: '#3b82f6', valColor: '#0f172a' },
    { label: 'Order selesai', value: String(O.filter(o => o.orderStatus === 'Selesai').length), hint: 'Bulan ini', accent: '#16a34a', valColor: '#0f172a' },
    { label: 'Total omzet', value: rp(omzet), hint: 'Akumulasi order', accent: '#4f46e5', valColor: '#4f46e5' },
    { label: 'Estimasi profit', value: rp(profit), hint: 'Dari fee jastip', accent: '#16a34a', valColor: '#16a34a' },
    { label: 'Piutang belum lunas', value: rp(piutang), hint: 'Total sisa tagihan', accent: '#dc2626', valColor: '#dc2626' },
  ];

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white border border-[#eef0f6] rounded-[15px] py-[17px] px-[18px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: s.accent }} />
            <div className="text-xs text-[#64748b] font-semibold">{s.label}</div>
            <div className="text-[23px] font-extrabold mt-1.5 tracking-tight" style={{ color: s.valColor }}>{s.value}</div>
            <div className="text-[11.5px] text-[#94a3b8] mt-[3px]">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#eef0f6] rounded-2xl mt-[18px] overflow-hidden">
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
      </div>
    </>
  );
}
