'use client';

import { useState, useEffect, useRef } from 'react';
import { Draft, Batch, OrderItem, Customer } from '@/lib/types';
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[18px] items-start">
      <div className="flex flex-col gap-4">
        {/* paste chat */}
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
              <SparkleIcon />
            </div>
            <div>
              <h3 className="m-0 text-[15px] font-bold">AI Auto-Fill dari Chat</h3>
              <p className="m-0 text-[11.5px] text-[#94a3b8]">Powered by AI — otomatis baca &amp; isi form</p>
            </div>
          </div>
          <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[11px] p-3 mb-3 text-[12px] text-[#3730a3] leading-relaxed">
            Cukup <b>copy-paste chat WhatsApp</b> dari customer ke kolom di bawah. AI akan otomatis mengenali <b>nama, nomor HP, alamat, produk, warna, ukuran, jumlah, dan harga</b> — lalu mengisi semua field secara otomatis.
          </div>
          <textarea value={chatText} onChange={e => onChatInput(e.target.value)} placeholder={"Contoh chat dari WhatsApp:\n\nKak mau ikut jastip Bangkok ya\nNama: Rina\nHP: 081234567890\nAlamat: Bogor\n\nMau order:\n1. Zara Dress warna Black size M harga 499rb\n2. Charles & Keith Bag warna Beige 1.250.000\n\nMakasih kak 🙏"} className="w-full min-h-[140px] md:min-h-[110px] p-[13px] border border-[#e2e8f0] rounded-xl text-[13px] md:text-[13.5px] leading-relaxed outline-none resize-y bg-[#fafbfd]" />
          <button onClick={onParseChat} className="mt-3 w-full md:w-auto inline-flex items-center justify-center gap-2 py-[12px] px-[20px] border-none rounded-[11px] text-white text-[13.5px] font-bold cursor-pointer transition-colors" style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            {parsing ? <span className="w-[15px] h-[15px] border-2 border-white/40 border-t-white rounded-full inline-block animate-[spin_.7s_linear_infinite]" /> : <SparkleIcon />}
            {parsing ? 'AI sedang membaca...' : 'Baca Chat dengan AI'}
          </button>
          {parsed && (
            <>
              <div className="mt-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-[13px_15px] animate-slideup">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#047857]">✨ AI berhasil membaca chat &amp; mengisi form otomatis!</div>
                <div className="text-[11.5px] text-[#059669] mt-1">Cek data di bawah, pastikan semua sudah benar sebelum disimpan.</div>
              </div>
              <div className="mt-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-[11px_14px] text-[11.5px] text-[#92400e] leading-relaxed">AI bisa salah membaca — selalu cek ulang harga &amp; detail produk sebelum menyimpan order.</div>
            </>
          )}
        </div>

        {/* customer & batch */}
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[26px] h-[26px] rounded-lg bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center text-[13px] font-extrabold">2</div>
            <h3 className="m-0 text-[15px] font-bold">Data Customer & Batch</h3>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
            <div>
              <label className={lblCls}>No WhatsApp <span className="text-[#ef4444]">*</span></label>
              <input value={d.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="08xxxx" className={inpCls} />
              <p className="m-0 mt-1 text-[10.5px] text-[#94a3b8] leading-snug">Jika nomor sudah terdaftar, nama &amp; data lainnya otomatis terisi.</p>
            </div>
            <div><label className={lblCls}>Nama Customer <span className="text-[#ef4444]">*</span></label><input value={d.name} onChange={e => onDraftField('name', e.target.value)} placeholder="cth. Rina Pratiwi" className={inpCls} /></div>
            <div><label className={lblCls}>Alamat</label><input value={d.address} onChange={e => onDraftField('address', e.target.value)} placeholder="Kota / alamat" className={inpCls} /></div>
            <div><label className={lblCls}>Instagram</label><input value={d.instagram} onChange={e => onDraftField('instagram', e.target.value)} placeholder="@username" className={inpCls} /></div>
            <div className="col-span-full">
              <label className={lblCls}>Pilih Batch Jastip</label>
              <select value={d.batchId} onChange={e => onDraftField('batchId', e.target.value)} className={inpCls}>
                <option value="">— Pilih batch —</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {matchedCustomer && !nameMismatch && (
              <div className="col-span-full bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-[11px_14px] text-[12.5px] text-[#047857]">
                Customer ditemukan: <b>{matchedCustomer.name}</b> — data otomatis terisi. Order baru akan tercatat di history customer ini.
              </div>
            )}
            {matchedCustomer && nameMismatch && (
              <div className="col-span-full bg-[#fffbeb] border border-[#fde68a] rounded-xl p-[12px_14px]">
                <div className="text-[12.5px] text-[#92400e] font-bold mb-1.5">Nama berbeda untuk nomor ini</div>
                <div className="text-[12px] text-[#92400e] leading-relaxed mb-2.5">
                  Nomor <b>{matchedCustomer.phone}</b> sudah terdaftar atas nama <b>{matchedCustomer.name}</b>, tapi di chat tertulis <b>{parsedName}</b>.
                </div>
                <div className="flex gap-2">
                  <button onClick={keepExistingName} className="flex-1 py-2 border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-[9px] text-[11.5px] font-bold cursor-pointer">Pakai &quot;{matchedCustomer.name}&quot;</button>
                  <button onClick={useNewName} className="flex-1 py-2 border border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5] rounded-[9px] text-[11.5px] font-bold cursor-pointer">Ganti ke &quot;{parsedName}&quot;</button>
                </div>
              </div>
            )}
            <div className="col-span-full"><label className={lblCls}>Catatan Customer</label><input value={d.custNotes} onChange={e => onDraftField('custNotes', e.target.value)} placeholder="cth. minta dikabari kalau sold out" className={inpCls} /></div>
          </div>
        </div>

        {/* items */}
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-[26px] h-[26px] rounded-lg bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center text-[13px] font-extrabold">3</div>
              <h3 className="m-0 text-[15px] font-bold">Detail Produk</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onAutoFee} title="Hitung ulang fee dari setting batch" className="py-2 px-[13px] border border-[#e2e8f0] rounded-[9px] bg-white text-[#475569] text-[12.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">↻ Hitung Fee</button>
              <button onClick={onAddItem} className="py-2 px-[13px] border border-dashed border-[#c7d2fe] rounded-[9px] bg-[#f5f3ff] text-[#4f46e5] text-[12.5px] font-bold cursor-pointer">+ Tambah Item</button>
            </div>
          </div>
          <div className="-mt-1 mb-3 text-[12px] text-[#64748b] flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-[#eef2ff] text-[#4338ca] rounded-full py-1 px-2.5 text-[11.5px] font-semibold">⚡ Fee otomatis</span>
            <span>Skema fee: <b className="text-[#0f172a]">{feeSummary}</b>. Fee jastip terisi otomatis & bisa diubah manual.</span>
          </div>
          {d.items.length === 0 && (
            <div className="py-[30px] text-center border border-dashed border-[#e2e8f0] rounded-xl">
              <div className="text-[28px]">🛍️</div>
              <div className="text-[13px] font-bold mt-1.5">Belum ada produk</div>
              <div className="text-xs text-[#94a3b8] mt-[3px]">Baca chat customer atau tambah item manual.</div>
            </div>
          )}
          <div className="flex flex-col gap-3.5">
            {d.items.map((it, idx) => (
              <div key={idx} className="border border-[#eef0f6] rounded-[13px] p-[15px] bg-[#fafbfd]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#64748b]">Item {idx + 1}</span>
                  <button onClick={() => onRemoveItem(idx)} className="bg-transparent border-none text-[#ef4444] text-xs font-semibold cursor-pointer">Hapus</button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-[11px]">
                  <div className="col-span-full"><label className={lblSmCls}>Nama Produk</label><input value={it.productName} onChange={e => onItemField(idx, 'productName', e.target.value)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Brand / Store</label><input value={it.brandStore} onChange={e => onItemField(idx, 'brandStore', e.target.value)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Link Produk</label><input value={it.productLink} onChange={e => onItemField(idx, 'productLink', e.target.value)} placeholder="https://" className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Warna</label><input value={it.color} onChange={e => onItemField(idx, 'color', e.target.value)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Size</label><input value={it.size} onChange={e => onItemField(idx, 'size', e.target.value)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Qty</label><input type="number" value={it.qty} onChange={e => onItemField(idx, 'qty', +e.target.value || 0)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Harga (Rp)</label><input type="number" value={it.priceInIdr} onChange={e => onItemField(idx, 'priceInIdr', +e.target.value || 0)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Fee Jastip</label><input type="number" value={it.jastipFee} onChange={e => onItemField(idx, 'jastipFee', +e.target.value || 0)} className={inpSmCls} /></div>
                  <div><label className={lblSmCls}>Biaya Lain</label><input type="number" value={it.otherFee} onChange={e => onItemField(idx, 'otherFee', +e.target.value || 0)} className={inpSmCls} /></div>
                </div>
                <div className="flex justify-end items-center gap-2 mt-3 pt-[11px] border-t border-[#eef0f6]">
                  <span className="text-xs text-[#64748b]">Subtotal item</span>
                  <span className="text-[15px] font-extrabold text-[#4f46e5]">{rp(itemSubtotal(it))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* summary sidebar */}
      <div className="sticky top-0 flex flex-col gap-4">
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
          <h3 className="m-0 mb-3.5 text-[15px] font-bold">Ringkasan Harga</h3>
          <div className="flex flex-col gap-[9px] text-[13px]">
            <div className="flex justify-between"><span className="text-[#64748b]">Total barang</span><span className="font-semibold">{rp(tProduct)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Total fee jastip</span><span className="font-semibold">{rp(tFee)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Biaya tambahan</span><span className="font-semibold">{rp(tOther)}</span></div>
            <div className="flex justify-between text-[11.5px]"><span className="text-[#94a3b8]">Ongkir</span><span className="text-[#94a3b8] italic">Diinput setelah packing</span></div>
            <div className="h-px bg-[#eef0f7] my-1" />
            <div className="flex justify-between text-[15px]"><span className="font-bold">Total order</span><span className="font-extrabold text-[#4f46e5]">{rp(tTotal)}</span></div>
          </div>
          <div className="h-px bg-[#eef0f7] my-3.5" />
          <label className={lblCls}>Metode Pembayaran</label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => { onDraftField('dpPercent', 50); onDraftField('paymentStatus', 'Menunggu DP'); onDraftField('orderStatus', 'Menunggu DP'); }} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold cursor-pointer transition-colors" style={{ border: `1.5px solid ${d.dpPercent < 100 ? '#4f46e5' : '#e2e8f0'}`, background: d.dpPercent < 100 ? '#f5f3ff' : '#fff', color: d.dpPercent < 100 ? '#4f46e5' : '#475569' }}>Pakai DP</button>
            <button onClick={() => { onDraftField('dpPercent', 100); onDraftField('paymentStatus', 'Menunggu Pelunasan'); onDraftField('orderStatus', 'Menunggu Pelunasan'); }} className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold cursor-pointer transition-colors" style={{ border: `1.5px solid ${d.dpPercent >= 100 ? '#4f46e5' : '#e2e8f0'}`, background: d.dpPercent >= 100 ? '#f5f3ff' : '#fff', color: d.dpPercent >= 100 ? '#4f46e5' : '#475569' }}>Bayar Lunas</button>
          </div>
          {d.dpPercent < 100 && (
            <div>
              <label className={lblCls}>DP Minimal (%)</label>
              <input type="number" value={d.dpPercent} onChange={e => onDraftField('dpPercent', +e.target.value || 0)} className={inpCls} />
            </div>
          )}
          <div className="flex flex-col gap-[9px] text-[13px] mt-3">
            {d.dpPercent < 100 && <div className="flex justify-between"><span className="text-[#64748b]">DP minimal</span><span className="font-bold">{rp(dpAmt)}</span></div>}
            <div className="flex justify-between"><span className="text-[#64748b]">{d.dpPercent >= 100 ? 'Total bayar' : 'Sudah dibayar'}</span><span className="font-bold">{rp(d.paid || 0)}</span></div>
            <div className="flex justify-between"><span className="text-[#64748b]">Sisa pembayaran</span><span className="font-extrabold text-[#d97706]">{rp(tTotal - (d.paid || 0))}</span></div>
          </div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
          <h3 className="m-0 mb-3 text-sm font-bold">Aturan & Status</h3>
          <label className={lblCls}>Status Pembayaran</label>
          <select value={d.paymentStatus} onChange={e => onDraftField('paymentStatus', e.target.value)} className={inpCls}>
            {PAY_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <label className={`${lblCls} mt-3`}>Status Order</label>
          <select value={d.orderStatus} onChange={e => onDraftField('orderStatus', e.target.value)} className={inpCls}>
            {ORDER_STATUSES.map(os => <option key={os} value={os}>{os}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[9px]">
          <button onClick={onSave} className="py-[13px] border-none rounded-xl bg-[#4f46e5] text-white text-sm font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Order</button>
          <button onClick={onSave} className="py-3 border border-[#e2e8f0] rounded-xl bg-white text-[#0f172a] text-[13.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Generate Invoice</button>
          <button onClick={onPreviewLink} className="py-3 border border-[#e2e8f0] rounded-xl bg-white text-[#0f172a] text-[13.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Preview Customer Link</button>
        </div>
      </div>
    </div>
  );
}
