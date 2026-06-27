'use client';

import { useState } from 'react';
import { Customer, Order } from '@/lib/types';
import { rp, dt, waLink, payBadge, ordBadge } from '@/lib/utils';
import { SearchIcon } from '@/lib/icons';
import Modal from './Modal';

interface Props {
  customers: Customer[];
  orders: Order[];
  search: string;
  onSearch: (v: string) => void;
  onAddCustomer: (c: Customer) => void;
  onUpdateCustomer: (c: Customer) => void;
  onOpenOrder: (id: string) => void;
  onToast: (m: string) => void;
}

const avPal: [string, string][] = [['#eef2ff', '#4f46e5'], ['#fef3c7', '#b45309'], ['#dcfce7', '#15803d'], ['#fee2e2', '#b91c1c'], ['#e0f2fe', '#0369a1']];
const lblCls = "block text-xs font-semibold text-[#475569] mb-[5px]";
const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";

const emptyForm = { name: '', phone: '', address: '', instagram: '' };

export default function CustomersPage({ customers, orders, search, onSearch, onAddCustomer, onUpdateCustomer, onOpenOrder, onToast }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);

  const q = search.toLowerCase();
  const filtered = customers.filter(c => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q));

  const submit = () => {
    if (!form.name.trim() || !form.phone.trim()) { onToast('Nama & No WhatsApp wajib diisi'); return; }
    onAddCustomer({ id: 'c' + Date.now(), name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), instagram: form.instagram.trim() });
    setForm(emptyForm);
    setShowAdd(false);
    onToast('Customer ditambahkan ✓');
  };

  const startEdit = () => {
    if (!detail) return;
    setEditForm({ name: detail.name, phone: detail.phone, address: detail.address, instagram: detail.instagram });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!detail) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) { onToast('Nama & No WhatsApp wajib diisi'); return; }
    const updated = { ...detail, name: editForm.name.trim(), phone: editForm.phone.trim(), address: editForm.address.trim(), instagram: editForm.instagram.trim() };
    onUpdateCustomer(updated);
    setDetail(updated);
    setEditing(false);
    onToast('Data customer diperbarui ✓');
  };

  const detailOrders = detail ? orders.filter(o => o.customerPhone.replace(/\D/g, '') === detail.phone.replace(/\D/g, '') || o.customerName === detail.name) : [];
  const totalSpent = detailOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = detailOrders.reduce((s, o) => s + o.paidAmount, 0);

  return (
    <>
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Cari nama, no WA, atau alamat..." className="w-full py-[11px] pr-3.5 pl-[38px] border border-[#e2e8f0] rounded-[11px] text-[13.5px] outline-none bg-white" />
        </div>
        <button onClick={() => setShowAdd(true)} className="py-[11px] px-4 border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer whitespace-nowrap hover:bg-[#4338ca] transition-colors">+ Tambah Customer</button>
      </div>
      {/* Desktop: tabel */}
      <div className="hidden md:block bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
        <div className="jp-scroll overflow-x-auto">
          <table className="w-full border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#fafbfd]">
                <th className="text-left py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Nama</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">WhatsApp</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Alamat</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Instagram</th>
                <th className="text-center py-3 px-4 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">Order</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const orderCount = orders.filter(o => o.customerPhone.replace(/\D/g, '') === c.phone.replace(/\D/g, '') || o.customerName === c.name).length;
                const [avBg, avColor] = avPal[i % 5];
                return (
                  <tr key={c.id} className="border-t border-[#f1f5f9] hover:bg-[#fafbff] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-[11px]">
                        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-[13px] shrink-0" style={{ background: avBg, color: avColor }}>{c.name[0]}</div>
                        <span className="text-[13.5px] font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-[#475569]">{c.phone}</td>
                    <td className="py-3.5 px-4 text-[13px] text-[#475569]">{c.address || '-'}</td>
                    <td className="py-3.5 px-4 text-[13px] text-[#6366f1]">{c.instagram || '-'}</td>
                    <td className="py-3.5 px-4 text-center text-[13px] font-bold">{orderCount}</td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button onClick={() => window.open(waLink(c.phone, `Halo Kak ${c.name}`), '_blank')} className="border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-lg py-1.5 px-[9px] cursor-pointer text-xs font-semibold mr-1.5">WA</button>
                      <button onClick={() => { setDetail(c); setEditing(false); }} className="border border-[#e2e8f0] bg-white text-[#475569] rounded-lg py-1.5 px-[11px] cursor-pointer text-xs font-semibold hover:border-[#c7d2fe] transition-colors">Detail</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-[50px] px-5 text-center">
            <div className="text-[34px] mb-2">🔍</div>
            <div className="text-sm font-bold">Customer tidak ditemukan</div>
            <div className="text-[12.5px] text-[#94a3b8] mt-1">Coba kata kunci lain atau tambah customer baru.</div>
          </div>
        )}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#eef0f6] rounded-[14px] py-10 text-center">
            <div className="text-[28px] mb-2">🔍</div>
            <div className="text-[13px] font-bold">Customer tidak ditemukan</div>
            <div className="text-[12px] text-[#94a3b8] mt-1">Coba kata kunci lain atau tambah customer baru.</div>
          </div>
        )}
        {filtered.map((c, i) => {
          const orderCount = orders.filter(o => o.customerPhone.replace(/\D/g, '') === c.phone.replace(/\D/g, '') || o.customerName === c.name).length;
          const [avBg, avColor] = avPal[i % 5];
          return (
            <div key={c.id} className="bg-white border border-[#eef0f6] rounded-[14px] p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[14px] shrink-0" style={{ background: avBg, color: avColor }}>{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold">{c.name}</div>
                  <div className="text-[11.5px] text-[#94a3b8] mt-[1px]">{c.phone} · {c.address || '-'}</div>
                  <div className="flex items-center gap-2 mt-[2px]">
                    {c.instagram && <span className="text-[11px] text-[#6366f1]">{c.instagram}</span>}
                    <span className="text-[11px] text-[#475569] font-semibold">{orderCount} order</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => window.open(waLink(c.phone, `Halo Kak ${c.name}`), '_blank')} className="flex-1 py-2 border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-[10px] cursor-pointer text-[12px] font-bold text-center">Chat WA</button>
                <button onClick={() => { setDetail(c); setEditing(false); }} className="flex-1 py-2 border border-[#e2e8f0] bg-white text-[#475569] rounded-[10px] cursor-pointer text-[12px] font-bold text-center active:bg-[#f8fafc]">Detail</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tambah Customer modal */}
      {showAdd && (
        <Modal title="Tambah Customer" subtitle="Lengkapi data customer baru" onClose={() => setShowAdd(false)}>
          <div className="flex flex-col gap-3.5">
            <div><label className={lblCls}>Nama Customer <span className="text-[#ef4444]">*</span></label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="cth. Rina Pratiwi" className={inpCls} autoFocus /></div>
            <div><label className={lblCls}>No WhatsApp <span className="text-[#ef4444]">*</span></label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xxxx" className={inpCls} /></div>
            <div><label className={lblCls}>Alamat</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Kota / alamat" className={inpCls} /></div>
            <div><label className={lblCls}>Instagram</label><input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@username" className={inpCls} /></div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-[#e2e8f0] rounded-xl bg-white text-[#0f172a] text-[13.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Batal</button>
              <button onClick={submit} className="flex-1 py-3 border-none rounded-xl bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Customer</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Customer modal */}
      {detail && (
        <Modal title={detail.name} subtitle="Detail customer & riwayat order" onClose={() => { setDetail(null); setEditing(false); }} maxWidth={520}>
          {!editing ? (
            <>
              <div className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2.5 text-[13px] mb-4">
                <span className="text-[#94a3b8]">No WhatsApp</span><span className="font-semibold text-right">{detail.phone}</span>
                <span className="text-[#94a3b8]">Alamat</span><span className="font-semibold text-right">{detail.address || '-'}</span>
                <span className="text-[#94a3b8]">Instagram</span><span className="font-semibold text-right text-[#6366f1]">{detail.instagram || '-'}</span>
                <span className="text-[#94a3b8]">Total order</span><span className="font-semibold text-right">{detailOrders.length}</span>
                <span className="text-[#94a3b8]">Total belanja</span><span className="font-semibold text-right text-[#4f46e5]">{rp(totalSpent)}</span>
                <span className="text-[#94a3b8]">Total dibayar</span><span className="font-semibold text-right text-[#16a34a]">{rp(totalPaid)}</span>
                <span className="text-[#94a3b8]">Sisa piutang</span><span className="font-semibold text-right text-[#d97706]">{rp(totalSpent - totalPaid)}</span>
              </div>
              <div className="flex gap-2 mb-4">
                <button onClick={() => window.open(waLink(detail.phone, `Halo Kak ${detail.name}`), '_blank')} className="flex-1 py-2.5 border-none rounded-[10px] bg-[#16a34a] text-white text-[13px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">Chat via WhatsApp</button>
                <button onClick={startEdit} className="flex-1 py-2.5 border border-[#e2e8f0] rounded-[10px] bg-white text-[#4f46e5] text-[13px] font-bold cursor-pointer hover:border-[#c7d2fe] hover:bg-[#f5f3ff] transition-colors">Edit Data</button>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <div className="flex flex-col gap-3">
                <div><label className={lblCls}>Nama Customer <span className="text-[#ef4444]">*</span></label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={inpCls} /></div>
                <div><label className={lblCls}>No WhatsApp <span className="text-[#ef4444]">*</span></label><input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={inpCls} /></div>
                <div><label className={lblCls}>Alamat</label><input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inpCls} /></div>
                <div><label className={lblCls}>Instagram</label><input value={editForm.instagram} onChange={e => setEditForm({ ...editForm, instagram: e.target.value })} className={inpCls} /></div>
              </div>
              <div className="flex gap-2.5 mt-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-[#e2e8f0] rounded-[10px] bg-white text-[#0f172a] text-[13px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Batal</button>
                <button onClick={saveEdit} className="flex-1 py-2.5 border-none rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Perubahan</button>
              </div>
            </div>
          )}
          <div className="text-[12.5px] font-bold text-[#475569] mb-2.5">Riwayat Order ({detailOrders.length})</div>
          {detailOrders.length === 0 ? (
            <div className="py-6 text-center text-[#94a3b8] text-[13px] border border-dashed border-[#e2e8f0] rounded-xl">Belum ada order dari customer ini.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {detailOrders.map(o => {
                const [pBg, pC] = payBadge(o.paymentStatus);
                const [oBg, oC] = ordBadge(o.orderStatus);
                return (
                  <div key={o.orderId} className="bg-[#fafbfd] border border-[#eef0f6] rounded-[11px] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-bold text-[#4f46e5]">{o.invoiceNo}</div>
                        <div className="text-[11.5px] text-[#94a3b8]">{o.batchName.replace('Jastip ', '')} · {dt(o.orderDate)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] font-bold whitespace-nowrap">{rp(o.totalAmount)}</div>
                        <button onClick={() => { setDetail(null); setEditing(false); onOpenOrder(o.orderId); }} className="py-1.5 px-[10px] border border-[#e2e8f0] rounded-lg bg-white text-[#4f46e5] text-[11.5px] font-bold cursor-pointer hover:border-[#c7d2fe] hover:bg-[#f5f3ff] transition-colors whitespace-nowrap">Lihat →</button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <span className="py-[3px] px-[8px] rounded-md text-[10.5px] font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
                      <span className="py-[3px] px-[8px] rounded-md text-[10.5px] font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
                    </div>
                    <div className="mt-2 text-[11.5px] text-[#64748b]">
                      {o.items.length} produk · Dibayar {rp(o.paidAmount)} · Sisa {rp(o.remainingAmount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
