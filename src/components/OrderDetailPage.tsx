'use client';

import { useState } from 'react';
import { Order, Batch, DetailTab, OrderItem } from '@/lib/types';
import { rp, dt, payBadge, ordBadge, buildSteps, buildInvoiceText, waLink, copyText, itemSubtotal, emptyItem, PAY_STATUSES, ORDER_STATUSES } from '@/lib/utils';
import { downloadInvoicePdf } from '@/lib/export';
import { LinkIcon } from '@/lib/icons';

interface Props {
  order: Order;
  batches: Batch[];
  tab: DetailTab;
  onSetTab: (t: DetailTab) => void;
  payForm: { amount: string; method: string; type: string };
  onPayFormChange: (f: string, v: string) => void;
  onAddPayment: () => void;
  onOrderFieldChange: (f: string, v: string) => void;
  onShipFieldChange: (f: string, v: string) => void;
  onSaveShip: () => void;
  onOpenTrack: () => void;
  onAddItemToOrder: (item: OrderItem) => void;
  onRemoveItemFromOrder: (idx: number) => void;
  onUpdateItemInOrder: (idx: number, item: OrderItem) => void;
  onSaveOngkir: (weight: number, shipCost: number) => void;
  storeName: string;
  bankInfo: string;
  onToast: (m: string) => void;
}

const tabDef: [DetailTab, string][] = [['produk', 'Produk'], ['ongkir', 'Ongkir'], ['bayar', 'Pembayaran'], ['timeline', 'Timeline'], ['invoice', 'Invoice'], ['link', 'Customer Link'], ['resi', 'Shipment']];
const lblCls = "block text-xs font-semibold text-[#475569] mb-[5px]";
const inpCls = "w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white";
const lblSmCls = "block text-[11.5px] font-semibold text-[#64748b] mb-1";
const inpSmCls = "w-full py-2 px-2.5 border border-[#e2e8f0] rounded-[9px] text-[13px] outline-none bg-white";

export default function OrderDetailPage({ order: o, batches, tab, onSetTab, payForm, onPayFormChange, onAddPayment, onOrderFieldChange, onShipFieldChange, onSaveShip, onOpenTrack, onAddItemToOrder, onRemoveItemFromOrder, onUpdateItemInOrder, onSaveOngkir, storeName, bankInfo, onToast }: Props) {
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<OrderItem>(emptyItem());
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<OrderItem>(emptyItem());
  const [ongkirWeight, setOngkirWeight] = useState(o.weight || 0);
  const [ongkirCost, setOngkirCost] = useState(o.shipCost || 0);
  const canAddItem = !['Dikirim ke Customer', 'Selesai', 'Cancel/Refund'].includes(o.orderStatus);
  const [pBg, pC] = payBadge(o.paymentStatus);
  const [oBg, oC] = ordBadge(o.orderStatus);
  const steps = buildSteps(o.orderStatus);
  const invoiceText = buildInvoiceText(o, storeName, bankInfo);
  const trackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/track/${o.trackingToken}`;

  const purchaseStatusBadge = (s: string): [string, string] => {
    if (s === 'Sudah Dibeli') return ['#dcfce7', '#15803d'];
    return ['#fef3c7', '#b45309'];
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setEditItem({ ...o.items[i] });
  };
  const cancelEdit = () => setEditIdx(null);
  const saveEdit = () => {
    if (editIdx === null) return;
    if (!editItem.productName.trim()) { onToast('Nama produk wajib diisi'); return; }
    onUpdateItemInOrder(editIdx, editItem);
    setEditIdx(null);
    onToast('Produk diperbarui ✓');
  };

  return (
    <>
      {/* header */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-[22px] mb-4">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="text-xs text-[#94a3b8] font-semibold">{o.invoiceNo} · {o.batchName}</div>
            <div className="text-[22px] font-extrabold tracking-tight mt-[3px]">{o.customerName}</div>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              <span className="py-[5px] px-[11px] rounded-lg text-xs font-bold" style={{ background: pBg, color: pC }}>{o.paymentStatus}</span>
              <span className="py-[5px] px-[11px] rounded-lg text-xs font-bold" style={{ background: oBg, color: oC }}>{o.orderStatus}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#94a3b8]">Total order</div>
            <div className="text-[26px] font-extrabold text-[#4f46e5] tracking-tight">{rp(o.totalAmount)}</div>
            <div className="text-xs text-[#94a3b8] mt-[2px]">Sisa: <b className="text-[#d97706]">{rp(o.remainingAmount)}</b></div>
          </div>
        </div>
        <div className="jp-scroll flex gap-1 mt-[18px] border-t border-[#f1f5f9] pt-1.5 overflow-x-auto">
          {tabDef.map(([k, label]) => (
            <button key={k} onClick={() => onSetTab(k)} className="py-[9px] px-3.5 border-none bg-transparent text-[13px] font-bold cursor-pointer whitespace-nowrap" style={{ color: k === tab ? '#4f46e5' : '#94a3b8', borderBottom: `2px solid ${k === tab ? '#4f46e5' : 'transparent'}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* tab: produk */}
      {tab === 'produk' && (
        <>
          <div className="bg-white border border-[#eef0f6] rounded-2xl overflow-hidden">
            <div className="jp-scroll overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#fafbfd]">
                    <th className="text-left py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Produk</th>
                    <th className="text-center py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Qty</th>
                    <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Harga</th>
                    <th className="text-right py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Fee</th>
                    <th className="text-center py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase">Status</th>
                    <th className="text-right py-3 px-5 text-[11px] font-bold text-[#94a3b8] uppercase">Subtotal</th>
                    {canAddItem && <th className="py-3 px-3 text-[11px] font-bold text-[#94a3b8] uppercase"></th>}
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((it, i) => {
                    const meta = [it.brandStore, it.color !== '-' ? it.color : null, it.size !== '-' ? it.size : null].filter(Boolean).join(' · ');
                    const [sBg, sC] = purchaseStatusBadge(it.purchaseStatus);
                    return (
                      <tr key={i} className="border-t border-[#f1f5f9]">
                        <td className="py-3.5 px-5"><div className="text-[13.5px] font-semibold">{it.productName}</div><div className="text-[11.5px] text-[#94a3b8]">{meta}</div></td>
                        <td className="py-3.5 px-3 text-center text-[13px]">{it.qty}</td>
                        <td className="py-3.5 px-3 text-right text-[13px]">{rp(it.priceInIdr)}</td>
                        <td className="py-3.5 px-3 text-right text-[13px]">{rp(it.jastipFee)}</td>
                        <td className="py-3.5 px-3 text-center">
                          {canAddItem ? (
                            <select value={it.purchaseStatus} onChange={e => onUpdateItemInOrder(i, { ...it, purchaseStatus: e.target.value as OrderItem['purchaseStatus'] })} className="py-1 px-1.5 border border-[#e2e8f0] rounded-md text-[11px] font-bold outline-none bg-white cursor-pointer" style={{ color: sC }}>
                              <option value="Menunggu Pembelian">Menunggu Pembelian</option>
                              <option value="Sudah Dibeli">Sudah Dibeli</option>
                            </select>
                          ) : (
                            <span className="inline-block py-[3px] px-[8px] rounded-md text-[10.5px] font-bold" style={{ background: sBg, color: sC }}>{it.purchaseStatus}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right text-[13px] font-bold">{rp(itemSubtotal(it))}</td>
                        {canAddItem && (
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <button onClick={() => startEdit(i)} className="bg-transparent border-none text-[#4f46e5] text-xs font-semibold cursor-pointer hover:underline mr-1.5">Edit</button>
                            {o.items.length > 1 && (
                              <button onClick={() => onRemoveItemFromOrder(i)} className="bg-transparent border-none text-[#ef4444] text-xs font-semibold cursor-pointer hover:underline">Hapus</button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit product form */}
          {editIdx !== null && canAddItem && (
            <div className="mt-3 bg-white border border-[#c7d2fe] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="m-0 text-[15px] font-bold text-[#4f46e5]">Edit Produk #{editIdx + 1}</h3>
                <button onClick={cancelEdit} className="bg-transparent border-none text-[#94a3b8] text-xs font-semibold cursor-pointer">Batal</button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-[11px]">
                <div className="col-span-full"><label className={lblSmCls}>Nama Produk</label><input value={editItem.productName} onChange={e => setEditItem({ ...editItem, productName: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Brand / Store</label><input value={editItem.brandStore} onChange={e => setEditItem({ ...editItem, brandStore: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Warna</label><input value={editItem.color} onChange={e => setEditItem({ ...editItem, color: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Size</label><input value={editItem.size} onChange={e => setEditItem({ ...editItem, size: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Qty</label><input type="number" value={editItem.qty} onChange={e => setEditItem({ ...editItem, qty: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Harga (Rp)</label><input type="number" value={editItem.priceInIdr} onChange={e => setEditItem({ ...editItem, priceInIdr: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Fee Jastip</label><input type="number" value={editItem.jastipFee} onChange={e => setEditItem({ ...editItem, jastipFee: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Biaya Lain</label><input type="number" value={editItem.otherFee} onChange={e => setEditItem({ ...editItem, otherFee: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div>
                  <label className={lblSmCls}>Status Pembelian</label>
                  <select value={editItem.purchaseStatus} onChange={e => setEditItem({ ...editItem, purchaseStatus: e.target.value as OrderItem['purchaseStatus'] })} className={inpSmCls}>
                    <option value="Menunggu Pembelian">Menunggu Pembelian</option>
                    <option value="Sudah Dibeli">Sudah Dibeli</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#eef0f6]">
                <span className="text-xs text-[#64748b]">Subtotal: <b className="text-[#4f46e5]">{rp(itemSubtotal(editItem))}</b></span>
                <button onClick={saveEdit} className="py-[10px] px-[18px] border-none rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Perubahan</button>
              </div>
            </div>
          )}

          {canAddItem && !addingItem && editIdx === null && (
            <button onClick={() => { setAddingItem(true); setNewItem(emptyItem()); }} className="mt-3 py-[11px] px-[18px] border border-dashed border-[#c7d2fe] rounded-[11px] bg-[#f5f3ff] text-[#4f46e5] text-[13px] font-bold cursor-pointer hover:bg-[#eef2ff] transition-colors w-full">+ Tambah Produk</button>
          )}

          {canAddItem && addingItem && (
            <div className="mt-3 bg-white border border-[#eef0f6] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="m-0 text-[15px] font-bold">Tambah Produk Baru</h3>
                <button onClick={() => setAddingItem(false)} className="bg-transparent border-none text-[#94a3b8] text-xs font-semibold cursor-pointer">Batal</button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-[11px]">
                <div className="col-span-full"><label className={lblSmCls}>Nama Produk</label><input value={newItem.productName} onChange={e => setNewItem({ ...newItem, productName: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Brand / Store</label><input value={newItem.brandStore} onChange={e => setNewItem({ ...newItem, brandStore: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Warna</label><input value={newItem.color} onChange={e => setNewItem({ ...newItem, color: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Size</label><input value={newItem.size} onChange={e => setNewItem({ ...newItem, size: e.target.value })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Qty</label><input type="number" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Harga (Rp)</label><input type="number" value={newItem.priceInIdr} onChange={e => setNewItem({ ...newItem, priceInIdr: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Fee Jastip</label><input type="number" value={newItem.jastipFee} onChange={e => setNewItem({ ...newItem, jastipFee: +e.target.value || 0 })} className={inpSmCls} /></div>
                <div><label className={lblSmCls}>Biaya Lain</label><input type="number" value={newItem.otherFee} onChange={e => setNewItem({ ...newItem, otherFee: +e.target.value || 0 })} className={inpSmCls} /></div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#eef0f6]">
                <span className="text-xs text-[#64748b]">Subtotal: <b className="text-[#4f46e5]">{rp(itemSubtotal(newItem))}</b></span>
                <button onClick={() => {
                  if (!newItem.productName.trim()) { onToast('Nama produk wajib diisi'); return; }
                  onAddItemToOrder(newItem);
                  setNewItem(emptyItem());
                  setAddingItem(false);
                  onToast('Produk ditambahkan ✓');
                }} className="py-[10px] px-[18px] border-none rounded-[10px] bg-[#4f46e5] text-white text-[13px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Produk</button>
              </div>
            </div>
          )}

          {!canAddItem && (
            <div className="mt-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3 text-[12.5px] text-[#92400e]">&#9888;&#65039; Produk tidak bisa ditambah/dihapus karena order sudah berstatus &quot;{o.orderStatus}&quot;.</div>
          )}
        </>
      )}

      {/* tab: ongkir */}
      {tab === 'ongkir' && (
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-[22px] max-w-[560px]">
          <h3 className="m-0 mb-1.5 text-[15px] font-bold">Ongkir &amp; Berat Paket</h3>
          <p className="m-0 mb-4 text-[12.5px] text-[#64748b] leading-relaxed">Input berat dan total ongkir setelah semua produk sudah dibeli dan dipacking.</p>
          {(() => {
            const bought = o.items.filter(it => it.purchaseStatus === 'Sudah Dibeli').length;
            const total = o.items.length;
            const allBought = bought === total;
            return (
              <>
                <div className="mb-4 p-3 rounded-[10px] text-[12.5px] font-semibold" style={{ background: allBought ? '#dcfce7' : '#fef3c7', color: allBought ? '#15803d' : '#b45309', border: `1px solid ${allBought ? '#bbf7d0' : '#fde68a'}` }}>
                  {allBought
                    ? `Semua ${total} produk sudah dibeli. Silakan input ongkir.`
                    : `${bought}/${total} produk sudah dibeli. ${total - bought} produk masih menunggu pembelian.`}
                </div>
                <div className="grid grid-cols-2 gap-[13px]">
                  <div>
                    <label className={lblCls}>Berat Paket (gram)</label>
                    <input type="number" value={ongkirWeight} onChange={e => setOngkirWeight(+e.target.value || 0)} placeholder="cth. 1500" className={inpCls} />
                    {ongkirWeight > 0 && <div className="text-[11.5px] text-[#64748b] mt-1">{(ongkirWeight / 1000).toFixed(1)} kg</div>}
                  </div>
                  <div>
                    <label className={lblCls}>Total Ongkir (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#94a3b8] font-semibold">Rp</span>
                      <input type="number" value={ongkirCost} onChange={e => setOngkirCost(+e.target.value || 0)} className={inpCls + ' pl-9'} />
                    </div>
                  </div>
                </div>
                <button onClick={() => { onSaveOngkir(ongkirWeight, ongkirCost); onToast('Ongkir disimpan ✓'); }} className="mt-4 py-3 px-[18px] border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Ongkir</button>
              </>
            );
          })()}
        </div>
      )}

      {/* tab: pembayaran */}
      {tab === 'bayar' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
              <h3 className="m-0 mb-3.5 text-[15px] font-bold">Ubah Status</h3>
              <label className={lblCls}>Status Pembayaran</label>
              <select value={o.paymentStatus} onChange={e => onOrderFieldChange('paymentStatus', e.target.value)} className={inpCls}>
                {PAY_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <label className={`${lblCls} mt-3`}>Status Order</label>
              <select value={o.orderStatus} onChange={e => onOrderFieldChange('orderStatus', e.target.value)} className={inpCls}>
                {ORDER_STATUSES.map(os => <option key={os} value={os}>{os}</option>)}
              </select>
              {o.paymentStatus !== 'Lunas' && (
                <div className="mt-3 bg-[#fef2f2] border border-[#fecaca] rounded-[10px] p-[10px_12px] text-[11.5px] text-[#b91c1c] leading-snug">
                  &#9888;&#65039; Order belum lunas &mdash; tidak boleh diubah ke &quot;Dikirim ke Customer&quot; sebelum pelunasan.
                </div>
              )}
            </div>
            <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
              <h3 className="m-0 mb-3.5 text-[15px] font-bold">Tambah Pembayaran</h3>
              <div className="flex flex-col gap-[11px]">
                <div><label className={lblSmCls}>Jumlah Bayar</label><input type="number" value={payForm.amount} onChange={e => onPayFormChange('amount', e.target.value)} className={inpSmCls} /></div>
                <div className="flex gap-2.5">
                  <div className="flex-1"><label className={lblSmCls}>Metode</label><select value={payForm.method} onChange={e => onPayFormChange('method', e.target.value)} className={inpSmCls}><option>Transfer BCA</option><option>Mandiri</option><option>QRIS</option><option>Cash</option></select></div>
                  <div className="flex-1"><label className={lblSmCls}>Jenis</label><select value={payForm.type} onChange={e => onPayFormChange('type', e.target.value)} className={inpSmCls}><option>DP</option><option>Pelunasan</option><option>Tambahan Ongkir</option><option>Refund</option></select></div>
                </div>
                <div><label className={lblSmCls}>Bukti Transfer (dummy)</label><div onClick={() => onToast('Fitur ini akan tersedia di versi berikutnya')} className="border border-dashed border-[#cbd5e1] rounded-[10px] py-4 text-center text-xs text-[#94a3b8] cursor-pointer">&#128206; Upload bukti transfer</div></div>
                <button onClick={onAddPayment} className="py-[11px] border-none rounded-[10px] bg-[#16a34a] text-white text-[13px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">+ Catat Pembayaran</button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#eef0f6] rounded-2xl mt-4 overflow-hidden">
            <div className="py-4 px-5 border-b border-[#f1f5f9] text-sm font-bold">Riwayat Pembayaran</div>
            {o.payments.map((p, i) => {
              const tag = p.type === 'DP' ? 'DP' : (p.type === 'Pelunasan' ? 'LN' : p.type.slice(0, 2).toUpperCase());
              return (
                <div key={i} className="flex items-center gap-3.5 py-3.5 px-5 border-t border-[#f8fafc]">
                  <div className="w-9 h-9 rounded-[9px] bg-[#dcfce7] text-[#15803d] flex items-center justify-center font-extrabold text-xs">{tag}</div>
                  <div className="flex-1"><div className="text-[13.5px] font-bold">{rp(p.amount)}</div><div className="text-[11.5px] text-[#94a3b8]">{p.method} · {p.date}</div></div>
                  <span className="py-1 px-[9px] rounded-[7px] text-[11px] font-bold bg-[#eef2ff] text-[#4f46e5]">{p.type}</span>
                </div>
              );
            })}
            {o.payments.length === 0 && <div className="py-[34px] text-center text-[#94a3b8] text-[13px]">Belum ada pembayaran tercatat.</div>}
          </div>
        </>
      )}

      {/* tab: timeline */}
      {tab === 'timeline' && (
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-6">
          {steps.map((st, i) => (
            <div key={i} className="flex gap-3.5 items-start">
              <div className="flex flex-col items-center self-stretch">
                <div className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold" style={{ background: st.dotBg, color: st.dotColor, border: `2px solid ${st.dotBorder}` }}>{st.icon}</div>
                {i < steps.length - 1 && <div className="w-[2px] flex-1 min-h-[20px]" style={{ background: st.lineColor }} />}
              </div>
              <div className="pb-[18px]"><div className="text-sm font-semibold" style={{ color: st.textColor }}>{st.label}</div><div className="text-xs text-[#94a3b8] mt-[1px]">{st.sub}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* tab: invoice */}
      {tab === 'invoice' && (
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <div className="bg-white border border-[#eef0f6] rounded-2xl p-[26px]">
            <div className="flex justify-between items-start border-b-2 border-[#1e1b4b] pb-4">
              <div><div className="text-lg font-extrabold">{storeName}</div><div className="text-[11.5px] text-[#94a3b8]">Invoice Jastip</div></div>
              <div className="text-right"><div className="text-[13px] font-extrabold text-[#4f46e5]">{o.invoiceNo}</div><div className="text-[11.5px] text-[#94a3b8]">{dt(o.orderDate)}</div></div>
            </div>
            <div className="mt-4 text-[12.5px]"><span className="text-[#94a3b8]">Kepada:</span> <b>{o.customerName}</b><br /><span className="text-[#94a3b8]">Batch:</span> {o.batchName}</div>
            <div className="mt-4">
              {o.items.map((it, i) => {
                const meta = [it.brandStore, it.color !== '-' ? it.color : null, it.size !== '-' ? it.size : null].filter(Boolean).join(' · ');
                return (
                  <div key={i} className="flex justify-between gap-2.5 py-[9px] border-b border-[#f1f5f9]">
                    <div><div className="text-[13px] font-semibold">{it.productName}</div><div className="text-[11px] text-[#94a3b8]">{meta} · Fee {rp(it.jastipFee)}</div></div>
                    <div className="text-[13px] font-bold whitespace-nowrap">{rp(itemSubtotal(it))}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3.5 flex flex-col gap-[7px] text-[13px]">
              <div className="flex justify-between"><span className="text-[#64748b]">Total Order</span><b>{rp(o.totalAmount)}</b></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Sudah Dibayar</span><b className="text-[#16a34a]">{rp(o.paidAmount)}</b></div>
              <div className="flex justify-between"><span className="text-[#64748b]">Sisa Pelunasan</span><b className="text-[#d97706]">{rp(o.remainingAmount)}</b></div>
            </div>
            <div className="mt-4 bg-[#f8fafc] rounded-[10px] p-3 text-[11.5px] text-[#475569] leading-relaxed">Pembayaran: <b>{bankInfo}</b><br />Order yang sudah dibelikan tidak bisa dibatalkan. Pelunasan wajib sebelum barang dikirim.</div>
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
              <h3 className="m-0 mb-2.5 text-sm font-bold">Teks WhatsApp Invoice</h3>
              <pre className="whitespace-pre-wrap font-[inherit] text-xs text-[#334155] bg-[#f8fafc] rounded-[10px] p-3.5 leading-relaxed m-0 max-h-[320px] overflow-auto">{invoiceText}</pre>
            </div>
            <div className="flex flex-col gap-[9px]">
              <button onClick={() => { copyText(invoiceText); onToast('Invoice disalin ✓'); }} className="py-3 border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Copy Invoice</button>
              <button onClick={() => window.open(waLink(o.customerPhone, invoiceText), '_blank')} className="py-3 border-none rounded-[11px] bg-[#16a34a] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">Kirim via WhatsApp</button>
              <button onClick={async () => { try { await downloadInvoicePdf(o, storeName, bankInfo); onToast('Invoice PDF diunduh ✓'); } catch { onToast('Gagal membuat PDF'); } }} className="py-3 border border-[#e2e8f0] rounded-[11px] bg-white text-[13.5px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Download PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* tab: customer link */}
      {tab === 'link' && (
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-6 max-w-[560px]">
          <h3 className="m-0 mb-1.5 text-[15px] font-bold">Customer Status Link</h3>
          <p className="m-0 mb-4 text-[#64748b] text-[12.5px]">Link publik tanpa login. Customer hanya melihat status order miliknya.</p>
          <div className="flex gap-2 items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[11px] p-[12px_14px]">
            <LinkIcon />
            <span className="flex-1 text-[12.5px] text-[#475569] font-mono truncate">{trackUrl}</span>
          </div>
          {(o.orderStatus === 'Dikirim ke Customer' || o.orderStatus === 'Selesai') && (o.courier || o.resi) && (
            <div className="mt-4 bg-[#eef2ff] border border-[#c7d2fe] rounded-[11px] p-[14px]">
              <div className="text-[12px] font-bold text-[#4338ca] mb-2">Info Pengiriman (tampil di halaman customer)</div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
                {o.courier && <><span className="text-[#64748b]">Kurir</span><span className="font-semibold">{o.courier}</span></>}
                {o.resi && <><span className="text-[#64748b]">No. Resi</span><span className="font-semibold font-mono">{o.resi}</span></>}
              </div>
            </div>
          )}
          <div className="flex gap-[9px] mt-3.5 flex-wrap">
            <button onClick={() => { copyText(trackUrl); onToast('Link disalin ✓'); }} className="py-[11px] px-4 border-none rounded-[11px] bg-[#4f46e5] text-white text-[13px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Copy Link</button>
            <button onClick={onOpenTrack} className="py-[11px] px-4 border border-[#e2e8f0] rounded-[11px] bg-white text-[13px] font-bold cursor-pointer hover:border-[#c7d2fe] transition-colors">Buka Preview</button>
            <button onClick={() => window.open(waLink(o.customerPhone, `Halo Kak ${o.customerName}, cek status order kamu di sini: ${trackUrl}`), '_blank')} className="py-[11px] px-4 border-none rounded-[11px] bg-[#16a34a] text-white text-[13px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors">Kirim Link via WA</button>
          </div>
        </div>
      )}

      {/* tab: shipment */}
      {tab === 'resi' && (
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-[22px] max-w-[560px]">
          <h3 className="m-0 mb-4 text-[15px] font-bold">Pengiriman ke Customer</h3>
          <div className="grid grid-cols-2 gap-[13px]">
            <div><label className={lblCls}>Kurir</label><input value={o.courier} onChange={e => onShipFieldChange('courier', e.target.value)} placeholder="JNE / J&T / SiCepat" className={inpCls} /></div>
            <div><label className={lblCls}>Nomor Resi</label><input value={o.resi} onChange={e => onShipFieldChange('resi', e.target.value)} placeholder="cth. JNE0099" className={inpCls} /></div>
            <div><label className={lblCls}>Tanggal Kirim</label><input type="date" value={o.shipDate} onChange={e => onShipFieldChange('shipDate', e.target.value)} className={inpCls} /></div>
            <div className="col-span-2"><label className={lblCls}>Status Pengiriman</label><select value={o.shipStatus} onChange={e => onShipFieldChange('shipStatus', e.target.value)} className={inpCls}><option>Belum dikirim</option><option>Sedang disiapkan</option><option>Dikirim</option><option>Diterima customer</option></select></div>
          </div>
          <button onClick={onSaveShip} className="mt-4 py-3 px-[18px] border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan Pengiriman</button>
        </div>
      )}
    </>
  );
}
