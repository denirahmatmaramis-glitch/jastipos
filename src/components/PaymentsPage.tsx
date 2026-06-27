'use client';

import { Order, Payment } from '@/lib/types';
import { rp } from '@/lib/utils';

interface Props {
  orders: Order[];
}

export default function PaymentsPage({ orders }: Props) {
  const allPayments: (Payment & { invoiceNo: string; customerName: string })[] = [];
  orders.forEach(o => o.payments.forEach(p => allPayments.push({ ...p, invoiceNo: o.invoiceNo, customerName: o.customerName })));
  allPayments.sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
      <div className="jp-scroll overflow-x-auto">
        <table className="w-full border-collapse min-w-[680px]">
          <thead>
            <tr className="bg-[#fafbfd]">
              <th className="text-left py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Tanggal</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase">Invoice</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase">Customer</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase">Metode</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase">Jenis</th>
              <th className="text-right py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {allPayments.map((p, i) => (
              <tr key={i} className="border-t border-[#f1f5f9] hover:bg-[#fafbff] transition-colors">
                <td className="py-[13px] px-5 text-[13px] text-[#475569]">{p.date}</td>
                <td className="py-[13px] px-4 text-[13px] font-bold text-[#4f46e5]">{p.invoiceNo}</td>
                <td className="py-[13px] px-4 text-[13px] font-semibold">{p.customerName}</td>
                <td className="py-[13px] px-4 text-[13px] text-[#475569]">{p.method}</td>
                <td className="py-[13px] px-4"><span className="py-1 px-[9px] rounded-[7px] text-[11px] font-bold bg-[#eef2ff] text-[#4f46e5]">{p.type}</span></td>
                <td className="py-[13px] px-5 text-right text-[13px] font-bold text-[#16a34a]">{rp(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
