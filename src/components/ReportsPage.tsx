'use client';

import { Order, Batch } from '@/lib/types';
import { rp } from '@/lib/utils';
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

  const reportCards = [
    { label: 'Total order', value: String(O.length), color: '#0f172a' },
    { label: 'Total omzet', value: rp(omzet), color: '#4f46e5' },
    { label: 'Total modal barang', value: rp(modal), color: '#0f172a' },
    { label: 'Total fee jastip', value: rp(profit), color: '#16a34a' },
    { label: 'Estimasi profit', value: rp(profit), color: '#16a34a' },
    { label: 'Belum lunas', value: rp(piutang), color: '#dc2626' },
  ];

  return (
    <>
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-4 mb-4 flex gap-3 flex-wrap items-end">
        <div><label className={lblSmCls}>Dari</label><input type="date" defaultValue="2026-06-01" className={inpSmCls} /></div>
        <div><label className={lblSmCls}>Sampai</label><input type="date" defaultValue="2026-06-30" className={inpSmCls} /></div>
        <div><label className={lblSmCls}>Batch</label><select className={inpSmCls}><option>Semua batch</option>{batches.map(b => <option key={b.id}>{b.name}</option>)}</select></div>
        <div className="flex-1" />
        <button onClick={async () => { try { await exportReportExcel(O); onToast('Laporan Excel diunduh ✓'); } catch { onToast('Gagal membuat Excel'); } }} className="py-2.5 px-4 border-none rounded-[10px] bg-[#16a34a] text-white text-[13px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">⬇ Export Excel</button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 mb-4">
        {reportCards.map((r, i) => (
          <div key={i} className="bg-white border border-[#eef0f6] rounded-[14px] p-4">
            <div className="text-xs text-[#64748b] font-semibold">{r.label}</div>
            <div className="text-xl font-extrabold mt-[5px]" style={{ color: r.color }}>{r.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
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
                <th className="text-right py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Profit est.</th>
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
      </div>
    </>
  );
}
