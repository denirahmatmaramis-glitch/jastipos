'use client';

import { useState } from 'react';
import { Batch, FeeConfig, FeeType } from '@/lib/types';
import { feeConfigSummary } from '@/lib/utils';

interface Props {
  globalFee: FeeConfig;
  batches: Batch[];
  onSaveGlobal: (cfg: FeeConfig) => void;
  onSaveBatch: (batchId: string, mode: 'global' | 'custom', cfg: FeeConfig) => void;
  onToast: (m: string) => void;
}

const feeTypeDef: [FeeType, string, string][] = [
  ['flat', 'Flat Fee', 'Fee tetap per item'],
  ['percent', 'Persentase', '% dari harga barang'],
  ['tier', 'Tier Harga', 'Fee per rentang harga'],
  ['custom', 'Custom', 'Per item manual'],
];

const panelTitle: Record<string, string> = {
  flat: 'Pengaturan Flat Fee',
  percent: 'Pengaturan Fee Persentase',
  tier: 'Tier Fee Berdasarkan Harga Barang',
  custom: 'Mode Fee Custom',
};

const inputCls = 'w-full py-2.5 px-3 border border-[#e2e8f0] rounded-[10px] text-[13.5px] outline-none bg-white';
const labelCls = 'block text-xs font-semibold text-[#475569] mb-1.5';

const clone = (c: FeeConfig): FeeConfig => ({ ...c, tiers: c.tiers.map(t => ({ ...t })) });

export default function FeesPage({ globalFee, batches, onSaveGlobal, onSaveBatch, onToast }: Props) {
  const [scope, setScope] = useState<string>('global'); // 'global' atau batchId
  const [working, setWorking] = useState<FeeConfig>(() => clone(globalFee));
  const [batchMode, setBatchMode] = useState<'global' | 'custom'>('global');

  const selectScope = (s: string) => {
    setScope(s);
    if (s === 'global') {
      setWorking(clone(globalFee));
    } else {
      const b = batches.find(x => x.id === s);
      const mode = b?.feeMode === 'custom' ? 'custom' : 'global';
      setBatchMode(mode);
      setWorking(clone(b?.feeConfig || globalFee));
    }
  };

  const setType = (t: FeeType) => setWorking(w => ({ ...w, type: t }));
  const setField = (k: keyof FeeConfig, v: number) => setWorking(w => ({ ...w, [k]: v }));

  const updateTier = (i: number, patch: Partial<{ from: number; upTo: number; fee: number; isPercent: boolean }>) =>
    setWorking(w => ({ ...w, tiers: w.tiers.map((t, idx) => idx === i ? { ...t, ...patch } : t) }));
  const addTier = () => setWorking(w => ({ ...w, tiers: [...w.tiers, { from: 0, upTo: 0, fee: 0, isPercent: false }] }));
  const removeTier = (i: number) => setWorking(w => ({ ...w, tiers: w.tiers.filter((_, idx) => idx !== i) }));

  const save = () => {
    if (scope === 'global') {
      onSaveGlobal(working);
      onToast('Setting fee global disimpan ✓');
    } else {
      onSaveBatch(scope, batchMode, working);
      onToast(batchMode === 'custom' ? 'Fee khusus batch disimpan ✓' : 'Batch mengikuti fee global ✓');
    }
  };

  const isBatch = scope !== 'global';
  const showEditor = !isBatch || batchMode === 'custom';

  return (
    <div className="max-w-[680px]">
      {/* scope selector */}
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-5 mb-4">
        <label className={labelCls}>Atur fee untuk</label>
        <select value={scope} onChange={e => selectScope(e.target.value)} className={inputCls}>
          <option value="global">🌐 Global — berlaku untuk semua batch (default)</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              📦 {b.name}{b.feeMode === 'custom' ? ' (fee khusus)' : ' (ikut global)'}
            </option>
          ))}
        </select>
        <p className="m-0 mt-2 text-[12px] text-[#64748b] leading-relaxed">
          {isBatch
            ? 'Setting batch ini bisa mengikuti fee global, atau diatur sendiri jika perhitungan fee-nya berbeda.'
            : 'Fee global jadi acuan semua batch yang tidak punya pengaturan khusus.'}
        </p>

        {isBatch && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setBatchMode('global')} className="flex-1 py-2.5 rounded-[10px] text-[12.5px] font-bold cursor-pointer transition-colors" style={{ border: `1.5px solid ${batchMode === 'global' ? '#4f46e5' : '#e2e8f0'}`, background: batchMode === 'global' ? '#f5f3ff' : '#fff', color: batchMode === 'global' ? '#4f46e5' : '#475569' }}>Ikuti fee global</button>
            <button onClick={() => setBatchMode('custom')} className="flex-1 py-2.5 rounded-[10px] text-[12.5px] font-bold cursor-pointer transition-colors" style={{ border: `1.5px solid ${batchMode === 'custom' ? '#4f46e5' : '#e2e8f0'}`, background: batchMode === 'custom' ? '#f5f3ff' : '#fff', color: batchMode === 'custom' ? '#4f46e5' : '#475569' }}>Atur fee khusus batch ini</button>
          </div>
        )}
      </div>

      {/* read-only ketika batch mengikuti global */}
      {isBatch && batchMode === 'global' && (
        <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
          <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[12px] p-4 text-[12.5px] text-[#3730a3] leading-relaxed">
            Batch ini <b>mengikuti fee global</b>: <b>{feeConfigSummary(globalFee)}</b>. Pilih &quot;Atur fee khusus batch ini&quot; jika ingin berbeda.
          </div>
          <button onClick={save} className="mt-4 py-3 px-[18px] border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">Simpan</button>
        </div>
      )}

      {/* editor */}
      {showEditor && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-[18px]">
            {feeTypeDef.map(([k, label, desc]) => (
              <div key={k} onClick={() => setType(k)} className="rounded-[13px] p-[15px] cursor-pointer transition-colors hover:border-[#a5b4fc]" style={{ border: `2px solid ${k === working.type ? '#4f46e5' : '#eef0f6'}`, background: k === working.type ? '#f5f3ff' : '#fff' }}>
                <div className="text-[13.5px] font-bold" style={{ color: k === working.type ? '#4f46e5' : '#0f172a' }}>{label}</div>
                <div className="text-[11.5px] text-[#94a3b8] mt-[3px]">{desc}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#eef0f6] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <h3 className="m-0 text-[15px] font-bold">{panelTitle[working.type]}</h3>
              {working.type === 'tier' && (
                <button onClick={addTier} className="py-2 px-[13px] border border-dashed border-[#c7d2fe] rounded-[9px] bg-[#f5f3ff] text-[#4f46e5] text-[12.5px] font-bold cursor-pointer">+ Tambah Tier</button>
              )}
            </div>

            {/* FLAT */}
            {working.type === 'flat' && (
              <div className="flex flex-col gap-3">
                <p className="m-0 text-[12.5px] text-[#64748b] leading-relaxed">Setiap produk dikenakan fee tetap (dikali jumlah/qty), berapa pun harga barangnya.</p>
                <div>
                  <label className={labelCls}>Fee tetap per item</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#94a3b8] font-semibold">Rp</span>
                    <input type="number" value={working.flatFee} onChange={e => setField('flatFee', +e.target.value || 0)} className={inputCls + ' pl-9'} />
                  </div>
                </div>
                <div className="bg-[#f5f3ff] border border-[#e0e7ff] rounded-[10px] p-3 text-[12px] text-[#4338ca]">Contoh: 2 pcs barang → fee <b>Rp{(working.flatFee * 2).toLocaleString('id-ID')}</b> (Rp{working.flatFee.toLocaleString('id-ID')} × 2).</div>
              </div>
            )}

            {/* PERCENT */}
            {working.type === 'percent' && (
              <div className="flex flex-col gap-3">
                <p className="m-0 text-[12.5px] text-[#64748b] leading-relaxed">Fee = persentase dari nilai barang, dengan batas minimum agar barang murah tetap untung.</p>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                  <div>
                    <label className={labelCls}>Persentase fee</label>
                    <div className="relative">
                      <input type="number" value={working.percent} onChange={e => setField('percent', +e.target.value || 0)} className={inputCls + ' pr-9'} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#94a3b8] font-semibold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Fee minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-[#94a3b8] font-semibold">Rp</span>
                      <input type="number" value={working.percentMin} onChange={e => setField('percentMin', +e.target.value || 0)} className={inputCls + ' pl-9'} />
                    </div>
                  </div>
                </div>
                <div className="bg-[#f5f3ff] border border-[#e0e7ff] rounded-[10px] p-3 text-[12px] text-[#4338ca]">Contoh: barang Rp1.000.000 → fee <b>Rp{Math.max(working.percentMin, Math.round(1000000 * working.percent / 100)).toLocaleString('id-ID')}</b>.</div>
              </div>
            )}

            {/* TIER */}
            {working.type === 'tier' && (
              <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-[1fr_1fr_120px_88px_28px] gap-2 px-1 text-[10.5px] font-bold text-[#94a3b8] uppercase tracking-wide">
                  <span>Harga dari</span><span>Harga sampai</span><span>Fee</span><span>Satuan</span><span></span>
                </div>
                {working.tiers.map((t, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_120px_88px_28px] gap-2 items-center bg-[#fafbfd] border border-[#eef0f6] rounded-[11px] p-[8px_10px]">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#94a3b8] font-semibold">Rp</span>
                      <input type="number" value={t.from} onChange={e => updateTier(i, { from: +e.target.value || 0 })} className="w-full py-2 pl-8 pr-2 border border-[#e2e8f0] rounded-[8px] text-[13px] font-semibold outline-none bg-white" />
                    </div>
                    {t.upTo === 0 ? (
                      <div className="py-2 px-2.5 text-[13px] font-semibold text-[#64748b]">∞ ke atas</div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#94a3b8] font-semibold">Rp</span>
                        <input type="number" value={t.upTo} onChange={e => updateTier(i, { upTo: +e.target.value || 0 })} className="w-full py-2 pl-8 pr-2 border border-[#e2e8f0] rounded-[8px] text-[13px] font-semibold outline-none bg-white" />
                      </div>
                    )}
                    <input type="number" value={t.fee} onChange={e => updateTier(i, { fee: +e.target.value || 0 })} className="w-full py-2 px-2.5 border border-[#e2e8f0] rounded-[8px] text-[13px] font-bold text-[#4f46e5] outline-none bg-white" />
                    <select value={t.isPercent ? 'pct' : 'rp'} onChange={e => updateTier(i, { isPercent: e.target.value === 'pct' })} className="w-full py-2 px-1.5 border border-[#e2e8f0] rounded-[8px] text-[12.5px] outline-none bg-white">
                      <option value="rp">Rp</option>
                      <option value="pct">%</option>
                    </select>
                    <button onClick={() => removeTier(i)} title="Hapus tier" className="bg-transparent border-none text-[#ef4444] cursor-pointer p-1" disabled={working.tiers.length <= 1} style={{ opacity: working.tiers.length <= 1 ? 0.3 : 1 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
                <p className="m-0 mt-1 text-[11.5px] text-[#94a3b8] leading-relaxed">Set kolom &quot;Harga sampai&quot; ke <b>0</b> untuk menandai range &quot;ke atas&quot; (tanpa batas atas).</p>
              </div>
            )}

            {/* CUSTOM */}
            {working.type === 'custom' && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[10px] p-4 text-[12.5px] text-[#92400e] leading-relaxed">Mode <b>Custom</b>: tidak ada aturan otomatis. Fee Jastip diisi manual per produk saat membuat order.</div>
                <p className="m-0 text-[12.5px] text-[#64748b] leading-relaxed">Cocok kalau fee tiap barang berbeda tergantung negosiasi dengan customer.</p>
              </div>
            )}

            <button onClick={save} className="mt-4 py-3 px-[18px] border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#4338ca] transition-colors">
              {isBatch ? 'Simpan Fee Batch Ini' : 'Simpan Setting Fee Global'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
