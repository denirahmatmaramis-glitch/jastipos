'use client';

import { useState } from 'react';
import { Batch, Order } from '@/lib/types';
import { rp, dt } from '@/lib/utils';
import { LocationIcon } from '@/lib/icons';
import Modal from './Modal';

interface Props {
  batches: Batch[];
  orders: Order[];
  onAddBatch: (b: Batch) => void;
  onToast: (m: string) => void;
}

function batchBadge(s: string): [string, string] {
  const m: Record<string, [string, string]> = { Open: ['#dcfce7', '#15803d'], Draft: ['#f1f5f9', '#475569'], Closed: ['#ffedd5', '#c2410c'], Completed: ['#dbeafe', '#1d4ed8'] };
  return m[s] || ['#f1f5f9', '#475569'];
}

const lblCls = "block text-xs font-semibold text-[#475569] mb-[5px]";
const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";
const emptyForm = { name: '', place: '', start: '', end: '', arrival: '', status: 'Draft', notes: '' };

export default function BatchesPage({ batches, orders, onAddBatch, onToast }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const submit = () => {
    if (!form.name.trim() || !form.place.trim()) { onToast('Nama batch & tempat wajib diisi'); return; }
    onAddBatch({ id: 'b' + Date.now(), name: form.name.trim(), place: form.place.trim(), start: form.start, end: form.end, arrival: form.arrival, status: form.status, notes: form.notes.trim() });
    setForm(emptyForm);
    setShowAdd(false);
    onToast('Batch dibuat ✓');
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowAdd(true)} className="py-[11px] px-4 border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">+ Buat Batch</button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4">
        {batches.map(b => {
          const bo = orders.filter(o => o.batchId === b.id);
          const [bg, color] = batchBadge(b.status);
          return (
            <div key={b.id} className="bg-white border border-[#eef0f6] rounded-2xl p-5 hover:border-[#c7d2fe] transition-colors">
              <div className="flex justify-between items-start gap-2.5">
                <div className="text-[15px] font-extrabold tracking-tight leading-snug">{b.name}</div>
                <span className="py-1 px-[9px] rounded-[7px] text-[11px] font-bold whitespace-nowrap" style={{ background: bg, color }}>{b.status}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#64748b] text-[12.5px] mt-2">
                <LocationIcon />{b.place}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 mt-3.5 text-[12.5px]">
                <span className="text-[#94a3b8]">Periode</span><span className="font-semibold text-right">{b.start ? `${dt(b.start)} – ${dt(b.end)}` : '-'}</span>
                <span className="text-[#94a3b8]">Estimasi tiba</span><span className="font-semibold text-right">{dt(b.arrival)}</span>
              </div>
              <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-[#f1f5f9]">
                <div className="flex-1"><div className="text-[11px] text-[#94a3b8]">Order</div><div className="text-base font-extrabold">{bo.length}</div></div>
                <div className="flex-1"><div className="text-[11px] text-[#94a3b8]">Omzet</div><div className="text-base font-extrabold">{rp(bo.reduce((s, o) => s + o.totalAmount, 0))}</div></div>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <Modal title="Buat Batch Jastip" subtitle="Atur trip & periode jastip baru" onClose={() => setShowAdd(false)} maxWidth={500}>
          <div className="flex flex-col gap-3.5">
            <div><label className={lblCls}>Nama Batch <span className="text-[#ef4444]">*</span></label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="cth. Jastip Bangkok Juli 2026" className={inpCls} autoFocus /></div>
            <div><label className={lblCls}>Tempat / Negara <span className="text-[#ef4444]">*</span></label><input value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} placeholder="cth. Bangkok, Thailand" className={inpCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lblCls}>Tanggal Mulai</label><input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className={inpCls} /></div>
              <div><label className={lblCls}>Tanggal Selesai</label><input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className={inpCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lblCls}>Estimasi Tiba</label><input type="date" value={form.arrival} onChange={e => setForm({ ...form, arrival: e.target.value })} className={inpCls} /></div>
              <div><label className={lblCls}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inpCls}><option>Draft</option><option>Open</option><option>Closed</option><option>Completed</option></select></div>
            </div>
            <div><label className={lblCls}>Catatan</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="cth. Fokus fashion & bag" className={inpCls} /></div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-[#e2e8f0] rounded-xl bg-white text-[#0f172a] text-[13.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Batal</button>
              <button onClick={submit} className="flex-1 py-3 border-none rounded-xl bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Batch</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
