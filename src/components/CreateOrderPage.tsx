'use client';

import { useState, useEffect, useRef } from 'react';
import { Draft, Batch, OrderItem, Customer } from '@/lib/types';
import NumInput from './NumInput';
import { rp, itemSubtotal, emptyItem, PAY_STATUSES, ORDER_STATUSES } from '@/lib/utils';
import { SparkleIcon } from '@/lib/icons';

interface Props {
  draft: Draft;
  batches: Batch[];
  customers: Customer[];
  chatText: string;
  parsing: boolean;
  parsed: boolean;
  onChatInput: (v: string) => void;
  onParseChat: () => void;
  onDraftField: (field: string, value: string | number) => void;
  onItemField: (idx: number, field: string, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onSave: () => void;
  onPreviewLink: () => void;
  feeSummary: string;
  onAutoFee: () => void;
  onToast: (m: string) => void;
}

const lblCls = "block text-xs font-semibold text-[#475569] mb-[5px]";
const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";
const lblSmCls = "block text-[11.5px] font-semibold text-[#64748b] mb-1";
const inpSmCls = "w-full py-2 px-2.5 border border-[#e2e8f0] rounded-[9px] text-[13px] outline-none bg-white";
const numFields = ['qty', 'priceInIdr', 'jastipFee', 'otherFee'];

export default function CreateOrderPage({ draft, batches, customers, chatText, parsing, parsed, onChatInput, onParseChat, onDraftField, onItemField, onAddItem, onRemoveItem, onSave, onPreviewLink, feeSummary, onAutoFee, onToast }: Props) {
  const d = draft;
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [nameMismatch, setNameMismatch] = useState(false);
  const [parsedName, setParsedName] = useState('');

  const checkPhoneMatch = (phone: string, currentName?: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 4) {
      const found = customers.find(c => c.phone.replace(/\D/g, '') === clean);
      if (found) {
        setMatchedCustomer(found);
        const nameToCheck = currentName || d.name;
        if (nameToCheck && nameToCheck.trim().toLowerCase() !== found.name.trim().toLowerCase()) {
          setNameMismatch(true);
          setParsedName(nameToCheck);
        } else {
          setNameMismatch(false);
          setParsedName('');
        }
        onDraftField('name', found.name);
        onDraftField('address', found.address);
        onDraftField('instagram', found.instagram);
        return;
      }
    }
    setMatchedCustomer(null);
    setNameMismatch(false);
    setParsedName('');
  };

  const handlePhoneChange = (val: string) => {
    onDraftField('phone', val);
    checkPhoneMatch(val);
  };

  const useNewName = () => {
    if (parsedName) onDraftField('name', parsedName);
    setNameMismatch(false);
  };

  const keepExistingName = () => {
    if (matchedCustomer) onDraftField('name', matchedCustomer.name);
    setNameMismatch(false);
  };
  // After AI parse, check if phone matches existing customer
  const prevParsed = useRef(parsed);
  useEffect(() => {
    if (parsed && !prevParsed.current && d.phone) {
      checkPhoneMatch(d.phone, d.name);
    }
    prevParsed.current = parsed;
  }, [parsed]);

  const tProduct = d.items.reduce((s, i) => s + i.priceInIdr * i.qty, 0);
  const tFee = d.items.reduce((s, i) => s + i.jastipFee, 0);
  const tOther = d.items.reduce((s, i) => s + (i.otherFee || 0), 0);
  const tTotal = tProduct + tFee + tOther;
  const dpAmt = Math.round(tTotal * (d.dpPercent || 0) / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 md:gap-[18px] items-start">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* paste chat — AI section */}
        <div className="relative rounded-[16px] md:rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)' }}>
          <div className="absolute top-[-20px] right-[-20px] w-[90px] h-[90px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="relative p-4 md:p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <SparkleIcon />
              </div>
              <div>
                <h3 className="m-0 text-[14px] md:text-[15px] font-bold text-white">AI Auto-Fill dari Chat</h3>
                <p className="m-0 text-[11px] text-white/60">Paste chat WA — AI isi form otomatis</p>
              </div>
            </div>
            <textarea value={chatText} onChange={e => onChatInput(e.target.value)} placeholder={"Contoh chat dari WhatsApp:\n\nKak mau ikut jastip ya\nNama: Rina\nHP: 081234567890\nAlamat: Bogor\n\nMau order:\n1. Zara Dress Black size M 499rb\n2. CK Bag Beige 1.250.000"} className="w-full min-h-[120px] md:min-h-[110px] p-3 border-none rounded-[12px] text-[13px] leading-relaxed outline-none resize-y" style={{ background: 'rgba(255,255,255,0.95)' }} />
            <button onClick={onParseChat} className="mt-3 w-full inline-flex items-center justify-center gap-2 py-[11px] border-none rounded-[11px] text-[#4f46e5] text-[13.5px] font-bold cursor-pointer bg-white transition-colors">
              {parsing ? <span className="w-[15px] h-[15px] border-2 border-[#4f46e5]/30 border-t-[#4f46e5] rounded-full inline-block animate-[spin_.7s_linear_infinite]" /> : <SparkleIcon />}
              {parsing ? 'AI sedang membaca...' : 'Baca Chat dengan AI'}
            </button>
          </div>
        </div>
        {parsed && (
          <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-[13px] p-3.5 animate-slideup">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#047857]">AI berhasil mengisi form!</div>
            <div className="text-[11.5px] text-[#059669] mt-1">Cek data di bawah sebelum simpan. AI bisa salah — selalu verifikasi.</div>
          </div>
        )}

        {/* customer & batch */}
        <div className="bg-white border border-[#eef0f6] rounded-[14px] md:rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="w-[24px] h-[24px] md:w-[26px] md:h-[26px] rounded-[8px] bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center text-[12px] md:text-[13px] font-extrabold">1</div>
            <h3 className="m-0 text-[14px] md:text-[15px] font-bold">Data Customer &amp; Batch</h3>
          </div>
          <div className="flex flex-col gap-3 md:grid md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:gap-3.5">
            <div>
              <label className={lblCls}>No WhatsApp <span className="text-[#ef4444]">*</span></label>
              <input value={d.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="08xxxx" className={inpCls} />
              <p className="m-0 mt-1 text-[10px] md:text-[10.5px] text-[#94a3b8] leading-snug">Nomor terdaftar → data otomatis terisi</p>
            </div>
            <div><label className={lblCls}>Nama Customer <span className="text-[#ef4444]">*</span></label><input value={d.name} onChange={e => onDraftField('name', e.target.value)} placeholder="cth. Rina Pratiwi" className={inpCls} /></div>
            <div className="grid grid-cols-2 gap-2.5 md:contents">
              <div><label className={lblCls}>Alamat</label><input value={d.address} onChange={e => onDraftField('address', e.target.value)} placeholder="Kota" className={inpCls} /></div>
              <div><label className={lblCls}>Instagram</label><input value={d.instagram} onChange={e => onDraftField('instagram', e.target.value)} placeholder="@user" className={inpCls} /></div>
            </div>
            <div className="md:col-span-full">
              <label className={lblCls}>Batch Jastip</label>
              <select value={d.batchId} onChange={e => onDraftField('batchId', e.target.value)} className={inpCls}>
                <option value="">— Pilih batch —</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {matchedCustomer && !nameMismatch && (
              <div className="md:col-span-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-[11px] p-3 text-[12px] text-[#047857]">
                Customer ditemukan: <b>{matchedCustomer.name}</b> — data otomatis terisi.
              </div>
            )}
            {matchedCustomer && nameMismatch && (
              <div className="md:col-span-full bg-[#fffbeb] border border-[#fde68a] rounded-[11px] p-3">
                <div className="text-[12px] text-[#92400e] font-bold mb-1">Nama berbeda untuk nomor ini</div>
                <div className="text-[11.5px] text-[#92400e] leading-relaxed mb-2">
                  Terdaftar: <b>{matchedCustomer.name}</b> · Chat: <b>{parsedName}</b>
                </div>
                <div className="flex gap-2">
                  <button onClick={keepExistingName} className="flex-1 py-2 border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-[9px] text-[11px] font-bold cursor-pointer">Pakai &quot;{matchedCustomer.name}&quot;</button>
                  <button onClick={useNewName} className="flex-1 py-2 border border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5] rounded-[9px] text-[11px] font-bold cursor-pointer">Ganti ke &quot;{parsedName}&quot;</button>
                </div>
              </div>
            )}
            <div className="md:col-span-full"><label className={lblCls}>Catatan</label><input value={d.custNotes} onChange={e => onDraftField('custNotes', e.target.value)} placeholder="cth. minta dikabari kalau sold out" className={inpCls} /></div>
          </div>
        </div>

        {/* items */}
        <div className="bg-white border border-[#eef0f6] rounded-[14px] md:rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-[24px] h-[24px] md:w-[26px] md:h-[26px] rounded-[8px] bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center text-[12px] md:text-[13px] font-extrabold">2</div>
              <h3 className="m-0 text-[14px] md:text-[15px] font-bold">Detail Produk</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onAutoFee} className="py-1.5 px-2.5 md:py-2 md:px-[13px] border border-[#e2e8f0] rounded-[8px] bg-white text-[#475569] text-[11px] md:text-[12.5px] font-bold cursor-pointer">↻ Fee</button>
              <button onClick={onAddItem} className="py-1.5 px-2.5 md:py-2 md:px-[13px] border border-dashed border-[#c7d2fe] rounded-[8px] bg-[#f5f3ff] text-[#4f46e5] text-[11px] md:text-[12.5px] font-bold cursor-pointer">+ Item</button>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-[#eef2ff] text-[#4338ca] rounded-full py-0.5 px-2 text-[10.5px] md:text-[11.5px] font-semibold">Fee otomatis</span>
            <span className="text-[11px] md:text-[12px] text-[#64748b]">{feeSummary}</span>
          </div>
          {d.items.length === 0 && (
            <div className="py-8 text-center border border-dashed border-[#e2e8f0] rounded-[12px]">
              <div className="w-[48px] h-[48px] mx-auto rounded-full bg-[#f5f3ff] flex items-center justify-center text-[22px] mb-2">🛍️</div>
              <div className="text-[13px] font-bold text-[#475569]">Belum ada produk</div>
              <div className="text-[11px] text-[#94a3b8] mt-1">Paste chat atau tambah item manual</div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {d.items.map((it, idx) => (
              <div key={idx} className="border border-[#eef0f6] rounded-[12px] md:rounded-[13px] overflow-hidden">
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                <div className="p-3 md:p-[15px] bg-[#fafbfd]">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[11px] md:text-xs font-bold text-[#64748b]">Produk {idx + 1}</span>
                    <button onClick={() => onRemoveItem(idx)} className="bg-transparent border-none text-[#ef4444] text-[11px] font-semibold cursor-pointer">Hapus</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2 md:gap-[11px]">
                    <div className="col-span-2 md:col-span-full"><label className={lblSmCls}>Nama Produk</label><input value={it.productName} onChange={e => onItemField(idx, 'productName', e.target.value)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Brand</label><input value={it.brandStore} onChange={e => onItemField(idx, 'brandStore', e.target.value)} className={inpSmCls} /></div>
                    <div className="hidden md:block"><label className={lblSmCls}>Link Produk</label><input value={it.productLink} onChange={e => onItemField(idx, 'productLink', e.target.value)} placeholder="https://" className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Warna</label><input value={it.color} onChange={e => onItemField(idx, 'color', e.target.value)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Size</label><input value={it.size} onChange={e => onItemField(idx, 'size', e.target.value)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Qty</label><NumInput value={it.qty} onChange={v => onItemField(idx, 'qty', v)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Harga (Rp)</label><NumInput value={it.priceInIdr} onChange={v => onItemField(idx, 'priceInIdr', v)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Fee Jastip</label><NumInput value={it.jastipFee} onChange={v => onItemField(idx, 'jastipFee', v)} className={inpSmCls} /></div>
                    <div><label className={lblSmCls}>Biaya Lain</label><NumInput value={it.otherFee} onChange={v => onItemField(idx, 'otherFee', v)} className={inpSmCls} /></div>
                  </div>
                  <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-[#eef0f6]">
                    <span className="text-[11px] text-[#64748b]">Subtotal</span>
                    <span className="text-[15px] font-extrabold text-[#4f46e5]">{rp(itemSubtotal(it))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* summary sidebar / bottom on mobile */}
      <div className="sticky top-0 flex flex-col gap-3 md:gap-4">
        {/* Ringkasan */}
        <div className="bg-white border border-[#eef0f6] rounded-[14px] md:rounded-2xl p-4 md:p-5">
          <h3 className="m-0 mb-3 text-[14px] md:text-[15px] font-bold">Ringkasan</h3>
          <div className="flex flex-col gap-2 text-[12.5px] md:text-[13px]">
            <div className="flex justify-between"><span className="text-[#64748b]">Total barang</span><span className="font-semibold">{rp(tProduct)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Fee jastip</span><span className="font-semibold">{rp(tFee)}</span></div>
            {tOther > 0 && <div className="flex justify-between"><span className="text-[#64748b]">Biaya lain</span><span className="font-semibold">{rp(tOther)}</span></div>}
            <div className="flex justify-between text-[10.5px]"><span className="text-[#94a3b8]">Ongkir</span><span className="text-[#94a3b8] italic">Setelah packing</span></div>
            <div className="h-px bg-[#eef0f7] my-0.5" />
            <div className="flex justify-between text-[15px]"><span className="font-bold">Total</span><span className="font-extrabold text-[#4f46e5]">{rp(tTotal)}</span></div>
          </div>

          <div className="h-px bg-[#eef0f7] my-3" />

          {/* Metode pembayaran */}
          <label className="block text-[11px] md:text-xs font-semibold text-[#475569] mb-1.5">Metode Pembayaran</label>
          <div className="flex gap-2 mb-2.5">
            <button onClick={() => { onDraftField('dpPercent', 50); onDraftField('paymentStatus', 'Menunggu DP'); onDraftField('orderStatus', 'Menunggu DP'); }} className="flex-1 py-2 rounded-[9px] text-[11.5px] md:text-[12px] font-bold cursor-pointer" style={{ border: `1.5px solid ${d.dpPercent < 100 ? '#4f46e5' : '#e2e8f0'}`, background: d.dpPercent < 100 ? '#f5f3ff' : '#fff', color: d.dpPercent < 100 ? '#4f46e5' : '#475569' }}>Pakai DP</button>
            <button onClick={() => { onDraftField('dpPercent', 100); onDraftField('paymentStatus', 'Menunggu Pelunasan'); onDraftField('orderStatus', 'Menunggu Pelunasan'); }} className="flex-1 py-2 rounded-[9px] text-[11.5px] md:text-[12px] font-bold cursor-pointer" style={{ border: `1.5px solid ${d.dpPercent >= 100 ? '#4f46e5' : '#e2e8f0'}`, background: d.dpPercent >= 100 ? '#f5f3ff' : '#fff', color: d.dpPercent >= 100 ? '#4f46e5' : '#475569' }}>Bayar Lunas</button>
          </div>
          {d.dpPercent < 100 && (
            <div className="mb-2">
              <label className="block text-[10.5px] font-semibold text-[#94a3b8] mb-1">DP (%)</label>
              <NumInput value={d.dpPercent} onChange={v => onDraftField('dpPercent', v)} className={inpCls + ' text-[13px]'} />
            </div>
          )}
          <div className="flex flex-col gap-1.5 text-[12px] md:text-[13px]">
            {d.dpPercent < 100 && <div className="flex justify-between"><span className="text-[#64748b]">DP minimal</span><span className="font-bold">{rp(dpAmt)}</span></div>}
            <div className="flex justify-between"><span className="text-[#64748b]">Sisa</span><span className="font-extrabold text-[#d97706]">{rp(tTotal - (d.paid || 0))}</span></div>
          </div>
        </div>

        {/* Save buttons */}
        <button onClick={onSave} className="py-3 md:py-[13px] border-none rounded-[12px] md:rounded-xl text-white text-[14px] font-bold cursor-pointer transition-colors" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>Simpan Order</button>
      </div>
    </div>
  );
}
