'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
}

interface Props {
  onToast: (m: string) => void;
}

export default function SuperAdminPage({ onToast }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchUsers = async () => {
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
  };

  useEffect(() => { fetchUsers(); }, []);

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

  const planBadge = (plan: string, status: string): [string, string, string] => {
    if (plan === 'pro') return ['Pro', '#dcfce7', '#15803d'];
    if (status === 'pending') return ['Pending', '#fef3c7', '#b45309'];
    return ['Free', '#f1f5f9', '#475569'];
  };

  const dt = (s: string) => {
    if (!s) return '-';
    return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-[800px] py-10 text-center">
        <div className="w-8 h-8 border-3 border-[#e2e8f0] border-t-[#4f46e5] rounded-full animate-[spin_.7s_linear_infinite] mx-auto mb-3" />
        <div className="text-[#64748b] text-sm">Memuat data user...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px]">
      <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-[14px] p-4 mb-4 text-[12.5px] text-[#3730a3] leading-relaxed">
        Super Admin Dashboard — hanya bisa diakses oleh <b>{process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL}</b>. Kelola semua user JastipOS, approve upgrade Pro, dan monitor penggunaan.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
          <div className="text-[10.5px] text-[#64748b] font-semibold">Total User</div>
          <div className="text-[20px] font-extrabold mt-1">{users.length}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
          <div className="text-[10.5px] text-[#64748b] font-semibold">Pro</div>
          <div className="text-[20px] font-extrabold mt-1 text-[#15803d]">{users.filter(u => u.plan === 'pro').length}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
          <div className="text-[10.5px] text-[#64748b] font-semibold">Pending</div>
          <div className="text-[20px] font-extrabold mt-1 text-[#b45309]">{users.filter(u => u.upgradeStatus === 'pending').length}</div>
        </div>
        <div className="bg-white border border-[#eef0f6] rounded-[13px] p-3.5">
          <div className="text-[10.5px] text-[#64748b] font-semibold">Free</div>
          <div className="text-[20px] font-extrabold mt-1">{users.filter(u => u.plan === 'free').length}</div>
        </div>
      </div>

      {/* Pending upgrades — highlight */}
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
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fafbfd]">
                <th className="text-left py-2.5 px-5 text-[10.5px] font-bold text-[#94a3b8] uppercase">Email</th>
                <th className="text-left py-2.5 px-4 text-[10.5px] font-bold text-[#94a3b8] uppercase">Toko</th>
                <th className="text-center py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Plan</th>
                <th className="text-center py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Order</th>
                <th className="text-center py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Customer</th>
                <th className="text-left py-2.5 px-3 text-[10.5px] font-bold text-[#94a3b8] uppercase">Daftar</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const [planLabel, planBg, planColor] = planBadge(u.plan, u.upgradeStatus);
                return (
                  <tr key={u.id} className="border-t border-[#f1f5f9]">
                    <td className="py-3 px-5 text-[13px] font-semibold">{u.email}</td>
                    <td className="py-3 px-4 text-[12.5px] text-[#64748b]">{u.storeName}</td>
                    <td className="py-3 px-3 text-center"><span className="py-1 px-2.5 rounded-md text-[10.5px] font-bold" style={{ background: planBg, color: planColor }}>{planLabel}</span></td>
                    <td className="py-3 px-3 text-center text-[13px] font-bold">{u.orderCount}</td>
                    <td className="py-3 px-3 text-center text-[13px]">{u.customerCount}</td>
                    <td className="py-3 px-3 text-[12px] text-[#94a3b8]">{dt(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {u.plan === 'free' ? (
                        <button onClick={() => doAction(u.id, 'activate')} disabled={acting === u.id} className="py-1.5 px-3 border border-[#d1fae5] bg-[#ecfdf5] text-[#059669] rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50">
                          {acting === u.id ? '...' : 'Aktifkan Pro'}
                        </button>
                      ) : (
                        <button onClick={() => doAction(u.id, 'deactivate')} disabled={acting === u.id} className="py-1.5 px-3 border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-50">
                          {acting === u.id ? '...' : 'Reset Free'}
                        </button>
                      )}
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
            return (
              <div key={u.id} className="border-t border-[#f1f5f9] p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold truncate">{u.email}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-[2px]">{u.storeName}</div>
                  </div>
                  <span className="py-1 px-2.5 rounded-md text-[10.5px] font-bold shrink-0" style={{ background: planBg, color: planColor }}>{planLabel}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11.5px] text-[#64748b]">
                  <span>{u.orderCount} order</span>
                  <span>{u.customerCount} customer</span>
                  <span>Daftar {dt(u.createdAt)}</span>
                </div>
                <div className="mt-2.5">
                  {u.plan === 'free' ? (
                    <button onClick={() => doAction(u.id, 'activate')} disabled={acting === u.id} className="w-full py-2 border-none rounded-[10px] bg-[#16a34a] text-white text-[12px] font-bold cursor-pointer disabled:opacity-50">
                      {acting === u.id ? 'Memproses...' : 'Aktifkan Pro'}
                    </button>
                  ) : (
                    <button onClick={() => doAction(u.id, 'deactivate')} disabled={acting === u.id} className="w-full py-2 border border-[#fecaca] rounded-[10px] bg-[#fef2f2] text-[#b91c1c] text-[12px] font-bold cursor-pointer disabled:opacity-50">
                      {acting === u.id ? 'Memproses...' : 'Reset ke Free'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
