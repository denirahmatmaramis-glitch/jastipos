'use client';

import { Route, Plan } from '@/lib/types';
import { FREE_ORDER_LIMIT } from '@/lib/store';
import { LogoIcon, LogoutIcon, DashboardIcon, CustomersIcon, BatchesIcon, OrdersIcon, CreateIcon, PaymentsIcon, ReportsIcon, FeesIcon, TemplatesIcon, StoreIcon } from '@/lib/icons';
import { ReactNode, useState } from 'react';

const navDef: [Route | 'create', string, () => ReactNode][] = [
  ['dashboard', 'Dashboard', DashboardIcon],
  ['customers', 'Customer', CustomersIcon],
  ['batches', 'Batch Jastip', BatchesIcon],
  ['orders', 'Order', OrdersIcon],
  ['create', 'Buat Order', CreateIcon],
  ['payments', 'Pembayaran', PaymentsIcon],
  ['reports', 'Laporan', ReportsIcon],
  ['fees', 'Setting Fee', FeesIcon],
  ['templates', 'Template WhatsApp', TemplatesIcon],
  ['store-settings', 'Pengaturan Toko', StoreIcon],
];

interface SidebarProps {
  route: Route;
  onNav: (r: Route) => void;
  onLogout: () => void;
  plan: Plan;
  orderCount: number;
}

export default function Sidebar({ route, onNav, onLogout, plan, orderCount }: SidebarProps) {
  const activePage = route === 'detail' ? 'orders' : route;
  const used = Math.min(orderCount, FREE_ORDER_LIMIT);
  const pct = Math.round((used / FREE_ORDER_LIMIT) * 100);

  return (
    <aside className="hidden md:flex w-[248px] shrink-0 flex-col sticky top-0 h-screen py-5 px-3.5" style={{ background: 'linear-gradient(180deg, #1e1b4b, #16142f)' }}>
      <div className="flex items-center gap-2.5 px-2 pb-[22px] pt-1.5">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}>
          <LogoIcon size={19} />
        </div>
        <span className="text-white text-[17px] font-extrabold tracking-tight">Jastip<span className="text-[#a5b4fc]">OS</span></span>
      </div>

      <nav className="jp-scroll flex flex-col gap-[3px] overflow-y-auto flex-1">
        {navDef.map(([key, label, Icon]) => {
          const active = key === activePage;
          return (
            <a
              key={key}
              onClick={() => onNav(key as Route)}
              className="flex items-center gap-[11px] py-2.5 px-3 rounded-[10px] cursor-pointer text-[13.5px] font-semibold no-underline transition-colors hover:bg-white/[.07]"
              style={{
                color: active ? '#fff' : 'rgba(199,202,240,.78)',
                background: active ? 'rgba(129,140,248,.22)' : 'transparent',
              }}
            >
              <span className="w-[18px] flex justify-center opacity-90"><Icon /></span>
              {label}
            </a>
          );
        })}
      </nav>

      {/* plan card */}
      <div className="mt-2">
        {plan === 'pro' ? (
          <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg,#b45309,#f59e0b)' }}>
            <span className="text-[16px]">⭐</span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[12.5px] font-extrabold">JastipOS Pro</div>
              <div className="text-white/80 text-[10.5px]">Order tak terbatas</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(129,140,248,.14)', border: '1px solid rgba(129,140,248,.25)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#c7cbf0] text-[11px] font-bold uppercase tracking-wide">Paket Gratis</span>
              <span className="text-white text-[11.5px] font-bold">{used}/{FREE_ORDER_LIMIT} order</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#f87171' : '#818cf8' }} />
            </div>
            <button onClick={() => onNav('upgrade')} className="mt-3 w-full py-2 border-none rounded-[9px] bg-white text-[#4338ca] text-[12px] font-bold cursor-pointer hover:bg-[#eef2ff] transition-colors">⭐ Upgrade ke Pro</button>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-3 mt-3">
        <a onClick={() => onNav('admin')} className="flex items-center gap-2.5 py-2 px-2 rounded-[9px] cursor-pointer text-[12px] font-semibold no-underline transition-colors hover:bg-white/[.07]" style={{ color: activePage === 'admin' ? '#fff' : 'rgba(199,202,240,.6)' }}>
          <span className="w-[18px] flex justify-center">🛡️</span>Panel Admin
        </a>
        <div className="flex items-center gap-2.5 px-2 py-1 mt-1">
          <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-[13px]">O</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[12.5px] font-bold">Owner Jastip</div>
            <div className="text-[#a5b4fc] text-[11px] truncate">owner@jastipos.id</div>
          </div>
          <button onClick={onLogout} title="Keluar" className="bg-transparent border-none text-[#a5b4fc] hover:text-white cursor-pointer p-1 transition-colors">
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MoreIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>;
}

const moreMenuItems: [Route, string, () => ReactNode][] = [
  ['customers', 'Customer', CustomersIcon],
  ['batches', 'Batch Jastip', BatchesIcon],
  ['fees', 'Setting Fee', FeesIcon],
  ['templates', 'Template WA', TemplatesIcon],
  ['store-settings', 'Pengaturan Toko', StoreIcon],
  ['payments', 'Pembayaran', PaymentsIcon],
  ['reports', 'Laporan', ReportsIcon],
];

export function BottomNav({ route, onNav }: { route: Route; onNav: (r: Route) => void }) {
  const activePage = route === 'detail' ? 'orders' : route;
  const [showMore, setShowMore] = useState(false);
  const mainItems: [Route, string, () => ReactNode][] = [
    ['dashboard', 'Home', DashboardIcon],
    ['orders', 'Order', OrdersIcon],
    ['create', 'Buat', CreateIcon],
  ];
  const isMoreActive = moreMenuItems.some(([k]) => k === activePage);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-[60px] left-2 right-2 rounded-[16px] p-3 animate-slideup" style={{ background: '#1e1b4b' }} onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-2">
              {moreMenuItems.map(([key, label, Icon]) => (
                <button key={key} onClick={() => { onNav(key); setShowMore(false); }} className="bg-transparent border-none flex flex-col items-center gap-[5px] cursor-pointer py-2.5 px-1 rounded-[10px] transition-colors" style={{ color: key === activePage ? '#fff' : 'rgba(199,202,240,.7)', background: key === activePage ? 'rgba(129,140,248,.22)' : 'transparent' }}>
                  <Icon />
                  <span className="text-[10px] font-semibold leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 flex md:hidden justify-around py-2 px-1.5 z-30 shadow-[0_-4px_20px_rgba(0,0,0,.2)]" style={{ background: '#1e1b4b' }}>
        {mainItems.map(([key, label, Icon]) => (
          <button key={key} onClick={() => { onNav(key); setShowMore(false); }} className="bg-transparent border-none flex flex-col items-center gap-[3px] cursor-pointer px-3 py-1 transition-colors" style={{ color: key === activePage ? '#fff' : 'rgba(199,202,240,.6)' }}>
            <Icon />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
        <button onClick={() => setShowMore(v => !v)} className="bg-transparent border-none flex flex-col items-center gap-[3px] cursor-pointer px-3 py-1 transition-colors" style={{ color: isMoreActive || showMore ? '#fff' : 'rgba(199,202,240,.6)' }}>
          <MoreIcon />
          <span className="text-[10px] font-semibold">Lainnya</span>
        </button>
      </div>
    </>
  );
}
