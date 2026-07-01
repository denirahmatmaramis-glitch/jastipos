'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const NOW = NOW;

interface AdminUser {
  id: string;
  email: string;
  storeName: string;
  plan: string;
  upgradeStatus: string;
  orderCount: number;
  customerCount: number;
  upgradeSenderName: string;
  upgradeAmount: number;
  upgradeCode: string;
  createdAt: string;
  proStartDate: string | null;
  proEndDate: string | null;
}

interface Props {
  onToast: (m: string) => void;
}

export default function SuperAdminPage({ onToast }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { onToast('Gagal memuat data admin'); return; }
      const json = await res.json();
      setUsers(json.users || []);
    } catch {
      onToast('Gagal memuat data admin');
    }
    setLoading(false);
  }, [onToast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doAction = async (userId: string, action: 'activate' | 'deactivate') => {
    setActing(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action, userId }),
      });
      const json = await res.json();
      if (res.ok) {
        onToast(json.message || 'Berhasil');
        await fetchUsers();
      } else {
        onToast(json.error || 'Gagal');
      }
    } catch {
      onToast('Gagal menjalankan aksi');
    }
    setActing(null);
  };

  const doDelete = async (user: AdminUser) => {
    setConfirmDelete(null);
    setActing(user.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'delete', userId: user.id }),
      });
      const json = await res.json();
      if (res.ok) {
        onToast('User berhasil dihapus');
        await fetchUsers();
      } else {
        onToast(json.error || 'Gagal menghapus user');
      }
    } catch {
      onToast('Gagal menghapus user');
    }
    setActing(null);
  };

  const doImpersonate = async (user: AdminUser) => {
    setActing(user.id + '_imp');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'impersonate', userId: user.id, email: user.email }),
      });
      const json = await res.json();
      if (res.ok && json.link) {
        window.open(json.link, '_blank');
        onToast('Tab baru dibuka — kamu masuk sebagai user ini ✓');
      } else {
        onToast(json.error || 'Gagal membuat link');
      }
    } catch {
      onToast('Gagal membuat link');
    }
    setActing(null);
  };

  const planBadge = (plan: string, status: string): [string, string, string] => {
    if (plan === 'pro') return ['Pro', '#dcfce7', '#15803d'];
    if (status === 'pending') return ['Pending', '#fef3c7', '#b45309'];
    return ['Free', '#f1f5f9', '#475569'];
  };

  const dt = (s: string | null) => {
    if (!s) return '-';
    return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - NOW) / 86400000);
  };

  if (loading) {
    return (
      <div className="max-w-[860px] py-10 text-center">
        <div className="w-8 h-8 border-3 border-[#e2e8f0] border-t-[#4f46e5] rounded-full animate-[spin_.7s_linear_infinite] mx-auto mb-3" />
        <div className="text-[#64748b] text-sm">Memuat data user...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[860px]">
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-[18px] p-6 max-w-[380px] w-full animate-scalein">
            <div className="text-[28px] text-center mb-2">🗑️</div>
            <h3 className="m-0 text-[16px] font-bold text-center text-[#0f172a]">Hapus User?</h3>
            <p className="mt-2 mb-5 text-[13px] text-[#64748b] text-center leading-relaxed">
              Akun <b>{confirmDelete.email}</b> beserta semua data ordernya akan dihapus permanen. Tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-[#e2e8f0] rounded-xl bg-white text-[#374151] text-[13.5px] font-semibold cursor-pointer hover:bg-[#f8fafc]">
                Batal
              </button>
              <button onClick={() => doDelete(confirmDelete)} className="flex-1 py-2.5 border-none rounded-xl bg-[#ef4444] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#dc2626]">
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[14px] p-4 mb-4 text-[12.5px] text-[#3730a3] leading-relaxed">
        Super Admin Dashboard — hanya bisa diakses oleh <b>{process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL}</b>. Kelola semua user JastipOS, approve upgrade Pro, dan monitor penggunaan.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {([
          ['Total User', users.length, ''],
          ['Pro', users.filter(u => u.plan === 'pro').length, '#15803d'],
          ['Pending', users.filter(u => u.upgradeStatus === 'pending').length, '#b45309'],
          ['Free', users.filter(u => u.plan === 'free').length, ''],
        ] as [string, number, string][]).map(([label, val, color]) => (
          <div key={label} className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
            <div className="text-[10.5px] text-[#64748b] font-semibold">{label}</div>
            <div className="text-[20px] font-extrabold mt-1" style={{ color: color || '#0f172a' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Pending upgrades */}
      {users.filter(u => u.upgradeStatus === 'pending').length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[14px] p-4 mb-4">
          <div className="text-[13px] font-bold text-[#92400e] mb-2.5">Menunggu Verifikasi Upgrade</div>
          {users.filter(u => u.upgradeStatus === 'pending').map(u => (
            <div key={u.id} className="bg-white border border-[#fde68a] rounded-[11px] p-3 mb-2 last:mb-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-bold">{u.email}</div>
                  <div className="text-[11px] text-[#94a3b8]">{u.storeName} · {u.orderCount} order</div>
                </div>
                <button onClick={() => doAction(u.id, 'activate')} disabled={acting === u.id} className="py-2 px-3.5 border-none rounded-[10px] bg-[#16a34a] text-white text-[12px] font-bold cursor-pointer hover:bg-[#15803d] transition-colors disabled:opacity-50 whitespace-nowrap">
                  {acting === u.id ? '...' : 'Aktivasi Pro'}
                </button>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 mt-2 pt-2 border-t border-[#fef3c7] text-[12px]">
                <span className="text-[#94a3b8]">Pengirim</span><span className="font-semibold">{u.upgradeSenderName || '-'}</span>
                <span className="text-[#94a3b8]">Total transfer</span><span className="font-semibold text-[#4f46e5]">{u.upgradeAmount ? `Rp${u.upgradeAmount.toLocaleString('id-ID')}` : '-'}</span>
                <span className="text-[#94a3b8]">Kode unik</span><span className="font-semibold">{u.upgradeCode || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All users */}
      <div className="bg-white border border-[#eef0f6] rounded-[16px] overflow-hidden">
        <div className="py-3.5 px-4 md:px-5 border-b border-[#f1f5f9] text-[14px] font-bold">Semua User ({users.length})</div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#fafbfd]">
                <th className="text-left py-2.5 px-4 text-[10.5px] font-bold text-[#94a3b8] uppercase">Email / Toko</th>
                <th className="text-center py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Plan</th>
                <th className="text-center py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Order</th>
                <th className="text-left py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Mulai Pro</th>
                <th className="text-left py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Berakhir</th>
                <th className="py-2.5 px-4 text-[10.5px] font-bold text-[#94a3b8] uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const [planLabel, planBg, planColor] = planBadge(u.plan, u.upgradeStatus);
                const dl = getDaysLeft(u.proEndDate);
                const expiring = dl !== null && dl <= 7 && u.plan === 'pro';
                return (
                  <tr key={u.id} className="border-t border-[#f1f5f9]">
                    <td className="py-3 px-4">
                      <div className="text-[13px] font-semibold text-[#0f172a]">{u.email}</div>
                      <div className="text-[11px] text-[#94a3b8]">{u.storeName} · daftar {dt(u.createdAt)}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="py-1 px-2.5 rounded-md text-[10.5px] font-bold" style={{ background: planBg, color: planColor }}>{planLabel}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-[13px] font-bold">{u.orderCount}</td>
                    <td className="py-3 px-3 text-[12px] text-[#64748b]">{u.plan === 'pro' ? dt(u.proStartDate) : '-'}</td>
                    <td className="py-3 px-3">
                      {u.plan === 'pro' ? (
                        <div>
                          <div className={`text-[12px] font-semibold ${expiring ? 'text-[#b45309]' : 'text-[#64748b]'}`}>{dt(u.proEndDate)}</div>
                          {dl !== null && <div className={`text-[11px] ${expiring ? 'text-[#ef4444]' : 'text-[#94a3b8]'}`}>{dl <= 0 ? '⚠️ Berakhir' : `${dl} hari lagi`}</div>}
                        </div>
                      ) : <span className="text-[#94a3b8] text-[12px]">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => doImpersonate(u)}
                          disabled={acting === u.id + '_imp'}
                          title="Masuk sebagai user ini (tab baru)"
                          className="py-1.5 px-2.5 border border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5] rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50 hover:bg-[#e0e7ff] transition-colors whitespace-nowrap"
                        >
                          {acting === u.id + '_imp' ? '...' : '🔑 Masuk'}
                        </button>
                        {u.plan === 'free' ? (
                          <button onClick={() => doAction(u.id, 'activate')} disabled={!!acting} className="py-1.5 px-2.5 border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap">
                            {acting === u.id ? '...' : 'Aktifkan Pro'}
                          </button>
                        ) : (
                          <button onClick={() => doAction(u.id, 'deactivate')} disabled={!!acting} className="py-1.5 px-2.5 border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap">
                            {acting === u.id ? '...' : 'Reset Free'}
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(u)}
                          disabled={!!acting}
                          title="Hapus user permanen"
                          className="py-1.5 px-2 border border-[#fecaca] bg-[#fef2f2] text-[#ef4444] rounded-lg text-[13px] cursor-pointer disabled:opacity-50 hover:bg-[#fee2e2] transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {users.map(u => {
            const [planLabel, planBg, planColor] = planBadge(u.plan, u.upgradeStatus);
            const dl = getDaysLeft(u.proEndDate);
            const expiring = dl !== null && dl <= 7 && u.plan === 'pro';
            return (
              <div key={u.id} className="border-t border-[#f1f5f9] p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold truncate">{u.email}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-[2px]">{u.storeName} · {u.orderCount} order · daftar {dt(u.createdAt)}</div>
                  </div>
                  <span className="py-1 px-2.5 rounded-md text-[10.5px] font-bold shrink-0" style={{ background: planBg, color: planColor }}>{planLabel}</span>
                </div>

                {/* Subscription dates (Pro only) */}
                {u.plan === 'pro' && (
                  <div className={`rounded-[10px] p-2.5 mb-2.5 text-[11.5px] ${expiring ? 'bg-[#fffbeb] border border-[#fde68a]' : 'bg-[#f8fafc] border border-[#e2e8f0]'}`}>
                    <div className="grid grid-cols-2 gap-y-1">
                      <span className="text-[#94a3b8]">Mulai berlangganan</span>
                      <span className="font-semibold">{dt(u.proStartDate)}</span>
                      <span className="text-[#94a3b8]">Berakhir</span>
                      <span className={`font-semibold ${expiring ? 'text-[#b45309]' : ''}`}>
                        {dt(u.proEndDate)}{dl !== null && dl > 0 ? ` (${dl}h)` : dl === 0 ? ' ⚠️' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => doImpersonate(u)}
                    disabled={acting === u.id + '_imp'}
                    className="flex-1 py-2 border border-[#c7d2fe] bg-[#eef2ff] text-[#4f46e5] rounded-[10px] text-[12px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {acting === u.id + '_imp' ? '...' : '🔑 Masuk sebagai'}
                  </button>
                  {u.plan === 'free' ? (
                    <button onClick={() => doAction(u.id, 'activate')} disabled={!!acting} className="flex-1 py-2 border-none rounded-[10px] bg-[#16a34a] text-white text-[12px] font-bold cursor-pointer disabled:opacity-50">
                      {acting === u.id ? '...' : 'Aktifkan Pro'}
                    </button>
                  ) : (
                    <button onClick={() => doAction(u.id, 'deactivate')} disabled={!!acting} className="flex-1 py-2 border border-[#fecaca] rounded-[10px] bg-[#fef2f2] text-[#b91c1c] text-[12px] font-bold cursor-pointer disabled:opacity-50">
                      {acting === u.id ? '...' : 'Reset Free'}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(u)}
                    disabled={!!acting}
                    className="py-2 px-3 border border-[#fecaca] bg-[#fef2f2] text-[#ef4444] rounded-[10px] text-[13px] cursor-pointer disabled:opacity-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
