'use client';

import { useState } from 'react';
import { Order, Payment } from '@/lib/types';
import { rp } from '@/lib/utils';
import { SearchIcon } from '@/lib/icons';

interface Props {
  orders: Order[];
}

const filterDef: [string, string][] = [['Semua', '📋'], ['DP', '💳'], ['Pelunasan', '💰'], ['Ongkir', '🚚'], ['Refund', '↩️']];

export default function PaymentsPage({ orders }: Props) {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');

  const allPayments: (Payment & { invoiceNo: string; customerName: string })[] = [];
  orders.forEach(o => o.payments.forEach(p => allPayments.push({ ...p, invoiceNo: o.invoiceNo, customerName: o.customerName })));
  allPayments.sort((a, b) => (a.date < b.date ? 1 : -1));

  const q = search.toLowerCase();
  const filtered = allPayments.filter(p => {
    if (filter !== 'Semua' && p.type !== filter) return false;
    if (q && !p.customerName.toLowerCase().includes(q) && !p.invoiceNo.toLowerCase().includes(q) && !p.method.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalIn = filtered.filter(p => p.type !== 'Refund').reduce((s, p) => s + p.amount, 0);
  const totalRefund = filtered.filter(p => p.type === 'Refund').reduce((s, p) => s + p.amount, 0);

  const typeBadge = (t: string): [string, string] => {
    if (t === 'DP') return ['#eef2ff', '#4f46e5'];
    if (t === 'Pelunasan') return ['#dcfce7', '#15803d'];
    if (t === 'Refund') return ['#fee2e2', '#b91c1c'];
    return ['#fef3c7', '#b45309'];
  };

  return (
    <>
      {/* Summary — mobile */}
      <div className="md:hidden flex gap-2.5 mb-3">
        <div className="flex-1 rounded-[13px] p-3.5 text-white" style={{ background: 'linear-gradient(135deg, #059669, #16a34a)' }}>
          <div className="text-[10.5px] opacity-80 font-semibold">Total Masuk</div>
          <div className="text-[18px] font-extrabold mt-1">{rp(totalIn)}</div>
          <div className="text-[10.5px] opacity-70 mt-[2px]">{filtered.filter(p => p.type !== 'Refund').length} transaksi</div>
        </div>
        {totalRefund > 0 && (
          <div className="flex-1 rounded-[13px] p-3.5 bg-white border border-[#eef0f6]">
            <div className="text-[10.5px] text-[#94a3b8] font-semibold">Refund</div>
            <div className="text-[18px] font-extrabold text-[#dc2626] mt-1">{rp(totalRefund)}</div>
          </div>
        )}
      </div>

      {/* Summary — desktop */}
      <div className="hidden md:flex gap-3.5 mb-4">
        <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 flex-1">
          <div className="text-xs text-[#94a3b8] font-semibold">Total Pembayaran Masuk</div>
          <div className="text-[22px] font-extrabold text-[#16a34a] mt-1">{rp(totalIn)}</div>
          <div className="text-[11px] text-[#94a3b8] mt-[2px]">{filtered.filter(p => p.type !== 'Refund').length} transaksi</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 flex-1">
          <div className="text-xs text-[#94a3b8] font-semibold">Refund</div>
          <div className="text-[22px] font-extrabold text-[#dc2626] mt-1">{rp(totalRefund)}</div>
          <div className="text-[11px] text-[#94a3b8] mt-[2px]">{filtered.filter(p => p.type === 'Refund').length} transaksi</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4 flex-1">
          <div className="text-xs text-[#94a3b8] font-semibold">Total Transaksi</div>
          <div className="text-[22px] font-extrabold mt-1">{filtered.length}</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-2.5 mb-3 md:mb-4">
        <div className="relative">
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama customer atau invoice..." className="w-full py-[10px] pr-3.5 pl-[38px] border border-[#e2e8f0] rounded-[11px] text-[13px] outline-none bg-white" />
        </div>
        <div className="jp-scroll flex gap-2 overflow-x-auto pb-1">
          {filterDef.map(([f, icon]) => (
            <button key={f} onClick={() => setFilter(f)} className="flex items-center gap-1.5 py-[7px] px-3 rounded-full text-[11.5px] font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-all" style={{ border: `1.5px solid ${f === filter ? '#4f46e5' : '#e2e8f0'}`, background: f === filter ? '#4f46e5' : '#fff', color: f === filter ? '#fff' : '#475569' }}>
              <span className="text-[12px]">{icon}</span>{f}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
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
              {filtered.map((p, i) => {
                const [bg, color] = typeBadge(p.type);
                return (
                  <tr key={i} className="border-t border-[#f1f5f9] hover:bg-[#fafbff] transition-colors">
                    <td className="py-[13px] px-5 text-[13px] text-[#475569]">{p.date}</td>
                    <td className="py-[13px] px-4 text-[13px] font-bold text-[#4f46e5]">{p.invoiceNo}</td>
                    <td className="py-[13px] px-4 text-[13px] font-semibold">{p.customerName}</td>
                    <td className="py-[13px] px-4 text-[13px] text-[#475569]">{p.method}</td>
                    <td className="py-[13px] px-4"><span className="py-1 px-[9px] rounded-[7px] text-[11px] font-bold" style={{ background: bg, color }}>{p.type}</span></td>
                    <td className="py-[13px] px-5 text-right text-[13px] font-bold text-[#16a34a]">{rp(p.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[#94a3b8] text-[13px]">Tidak ada pembayaran ditemukan.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#eef0f6] rounded-[14px] py-10 text-center">
            <div className="text-[28px] mb-2">💰</div>
            <div className="text-[13px] font-bold text-[#475569]">Tidak ada pembayaran</div>
            <div className="text-[12px] text-[#94a3b8] mt-1">{filter !== 'Semua' || search ? 'Coba filter atau kata kunci lain' : 'Pembayaran tercatat saat dicatat di detail order'}</div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {filtered.map((p, i) => {
            const [bg, color] = typeBadge(p.type);
            return (
              <div key={i} className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#16a34a]">{rp(p.amount)}</div>
                    <div className="text-[12.5px] font-semibold mt-[2px]">{p.customerName}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-[2px]">{p.invoiceNo} · {p.method} · {p.date}</div>
                  </div>
                  <span className="py-[3px] px-[8px] rounded-md text-[10px] font-bold shrink-0" style={{ background: bg, color }}>{p.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
