'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Order } from '@/lib/types';
import { supabaseConfigured } from '@/lib/supabase';
import * as db from '@/lib/db';
import TrackPage from '@/components/TrackPage';

export default function TrackPageRoute() {
  const params = useParams();
  const token = params.token as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('Toko Jastip Kamu');

  useEffect(() => {
    let active = true;
    if (!token || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [o, name] = await Promise.all([
          db.getOrderByToken(token),
          db.getStoreNameByToken(token),
        ]);
        if (!active) return;
        if (o) setOrder(o);
        if (name) setStoreName(name);
      } catch (e) {
        console.error('Track page error:', e);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef0f7]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#4f46e5] rounded-full animate-[spin_.7s_linear_infinite] mx-auto mb-3" />
          <div className="text-[#64748b] text-sm font-semibold">Memuat status order...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef0f7]">
        <div className="text-center max-w-[360px]">
          <div className="text-[40px] mb-3">📦</div>
          <div className="text-xl font-extrabold mb-1">Order tidak ditemukan</div>
          <div className="text-[#64748b] text-sm">Link tracking tidak valid atau order sudah dihapus.</div>
        </div>
      </div>
    );
  }

  return <TrackPage order={order} batches={[]} authed={false} storeName={storeName} onBack={() => {}} />;
}
