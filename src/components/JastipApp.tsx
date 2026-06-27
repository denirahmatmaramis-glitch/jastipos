'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Route, DetailTab, Order, OrderItem, FeeConfig } from '@/lib/types';
import { calcOrderTotals, emptyItem, applyFeesToDraft, effectiveFeeConfig, feeConfigSummary, calcFeeForItem, defaultFeeConfig } from '@/lib/utils';
import { AppState, FREE_ORDER_LIMIT, initialDraft, initialState as demoState } from '@/lib/store';
import { supabaseConfigured } from '@/lib/supabase';
import * as db from '@/lib/db';
import { PlusIcon } from '@/lib/icons';
import Sidebar, { BottomNav } from './Sidebar';
import Toast from './Toast';
import LoginPage from './LoginPage';
import TrackPage from './TrackPage';
import DashboardPage from './DashboardPage';
import CustomersPage from './CustomersPage';
import BatchesPage from './BatchesPage';
import OrdersPage from './OrdersPage';
import CreateOrderPage from './CreateOrderPage';
import OrderDetailPage from './OrderDetailPage';
import PaymentsPage from './PaymentsPage';
import ReportsPage from './ReportsPage';
import FeesPage from './FeesPage';
import TemplatesPage from './TemplatesPage';
import UpgradePage from './UpgradePage';
import SuperAdminPage from './SuperAdminPage';
import StoreSettingsPage from './StoreSettingsPage';

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';

const titles: Record<string, [string, string]> = {
  dashboard: ['Dashboard', 'Ringkasan operasional jastip kamu hari ini'],
  customers: ['Master Customer', 'Kelola data customer jastip'],
  batches: ['Batch Jastip', 'Atur trip & periode jastip'],
  orders: ['Order', 'Semua order jastip kamu'],
  create: ['Buat Order Baru', 'Tempel chat customer → AI bantu isi form'],
  detail: ['Detail Order', 'Kelola status, pembayaran & pengiriman'],
  payments: ['Pembayaran', 'Riwayat seluruh pembayaran masuk'],
  reports: ['Laporan & Rekap', 'Omzet, profit, dan piutang'],
  fees: ['Setting Fee', 'Atur skema fee jastip'],
  templates: ['Template WhatsApp', 'Pesan siap pakai untuk customer'],
  upgrade: ['Upgrade ke Pro', 'Buka order tak terbatas & semua fitur'],
  admin: ['Panel Admin', 'Verifikasi pembayaran & aktivasi Pro'],
  'store-settings': ['Pengaturan Toko', 'Nama toko & info rekening invoice'],
};

const emptyState: AppState = {
  authed: false, route: 'dashboard', selectedOrderId: '', trackOrderId: '',
  detailTab: 'produk', orderFilter: 'Semua', customerSearch: '', toast: '',
  parsing: false, parsed: false, chatText: '', draft: { ...initialDraft },
  payForm: { amount: '', method: 'Transfer BCA', type: 'Pelunasan' },
  globalFee: defaultFeeConfig(), customers: [], batches: [], orders: [],
  storeName: 'Toko Jastip Kamu', bankInfo: '',
  plan: 'free', upgradeStatus: 'none', upgradeCode: String(Math.floor(100 + Math.random() * 900)),
};

export default function JastipApp() {
  const [state, setState] = useState<AppState>(emptyState);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setState(s => ({ ...s, toast: m }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState(s => ({ ...s, toast: '' })), 2200);
  }, []);

  // Load all data from Supabase for a given user
  const loadData = useCallback(async (uid: string) => {
    try {
      const [profile, customers, batches, orders] = await Promise.all([
        db.getProfile(uid),
        db.getCustomers(uid),
        db.getBatches(uid),
        db.getOrders(uid),
      ]);
      const isNewUser = !profile?.bank_info;
      setState(s => ({
        ...s,
        authed: true,
        route: isNewUser ? 'store-settings' : 'dashboard',
        customers,
        batches,
        orders,
        storeName: profile?.store_name || 'Toko Jastip Kamu',
        bankInfo: profile?.bank_info || '',
        globalFee: profile?.fee_config || defaultFeeConfig(),
        plan: (profile?.plan || 'free') as 'free' | 'pro',
        upgradeStatus: (profile?.upgrade_status || 'none') as 'none' | 'pending' | 'active',
      }));
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    if (!supabaseConfigured) {
      // Demo mode: use initial sample data, no Supabase
      setState(demoState);
      setAppLoading(false);
      return;
    }

    (async () => {
      const session = await db.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        await loadData(session.user.id);
      }
      setAppLoading(false);
    })();

    const { data: { subscription } } = db.onAuthChange(async (session: unknown) => {
      const s = session as { user?: { id: string } } | null;
      if (s?.user) {
        setUserId(s.user.id);
        setUserEmail((s.user as { email?: string }).email || '');
        await loadData(s.user.id);
      } else {
        setUserId(null);
        setUserEmail('');
        setState(prev => ({ ...emptyState, toast: prev.toast }));
      }
    });
    return () => subscription.unsubscribe();
  }, [loadData]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      // Demo mode: accept any credentials
      setState(s => ({ ...s, authed: true, route: 'dashboard' }));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const { user } = await db.signIn(email, password);
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
        await loadData(user.id);
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Login gagal');
    }
    setAuthLoading(false);
  }, [loadData]);

  const handleRegister = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      setState(s => ({ ...s, authed: true, route: 'dashboard' }));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const { user } = await db.signUp(email, password);
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
        await loadData(user.id);
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Pendaftaran gagal');
    }
    setAuthLoading(false);
  }, [loadData]);

  const handleLogout = useCallback(async () => {
    if (supabaseConfigured) await db.signOut();
    setUserId(null);
    setState({ ...emptyState });
  }, []);

  // Helper: persist to Supabase in background (fire-and-forget with error toast)
  const persist = useCallback((fn: () => Promise<void>) => {
    fn().catch(e => {
      console.error('Persist error:', e, JSON.stringify(e));
      toast('Gagal menyimpan ke server');
    });
  }, [toast]);

  const nav = useCallback((r: Route) => {
    setState(s => {
      if (r === 'create' && s.plan === 'free' && s.orders.length >= FREE_ORDER_LIMIT) {
        return { ...s, route: 'upgrade' as Route };
      }
      return { ...s, route: r };
    });
  }, []);

  const openOrder = useCallback((id: string) => {
    setState(s => ({ ...s, selectedOrderId: id, route: 'detail' as Route, detailTab: 'produk' as DetailTab }));
  }, []);

  // ========== RENDER ==========

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(120% 120% at 0% 0%, #312e81 0%, #1e1b4b 45%, #0f0d2e 100%)' }}>
        <div className="text-center animate-slideup">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-[spin_.7s_linear_infinite] mx-auto mb-4" />
          <div className="text-white/80 text-sm font-semibold">Memuat JastipOS...</div>
        </div>
      </div>
    );
  }

  const isLogin = !state.authed && state.route !== 'track';
  const isTrack = state.route === 'track';

  if (isLogin) {
    return (
      <>
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} error={authError} loading={authLoading} />
        <Toast message={state.toast} />
      </>
    );
  }

  if (isTrack) {
    const trackOrder = state.orders.find(o => o.orderId === state.trackOrderId) || state.orders[0];
    return (
      <>
        <TrackPage order={trackOrder} batches={state.batches} authed={state.authed} storeName={state.storeName} onBack={() => nav('detail')} />
        <Toast message={state.toast} />
      </>
    );
  }

  const [pageTitle, pageSubtitle] = titles[state.route] || titles.dashboard;
  const curOrder = state.orders.find(o => o.orderId === state.selectedOrderId) || state.orders[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar route={state.route} onNav={nav} onLogout={handleLogout} plan={state.plan} orderCount={state.orders.length} userEmail={userEmail} />

      <main className="jp-scroll flex-1 min-w-0 p-[26px_30px] max-md:p-[14px_14px_80px] max-h-screen overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4 md:mb-[22px] flex-wrap">
          <div>
            <h1 className="m-0 text-[19px] md:text-[23px] font-extrabold tracking-tight">{pageTitle}</h1>
            <p className="mt-0.5 md:mt-1 mb-0 text-[#64748b] text-[12px] md:text-[13px] hidden md:block">{pageSubtitle}</p>
          </div>
          <button onClick={() => nav('create')} className="flex items-center gap-[7px] py-[11px] px-4 border-none rounded-[11px] bg-[#4f46e5] text-white text-[13.5px] font-bold cursor-pointer whitespace-nowrap hover:bg-[#4338ca] transition-colors">
            <PlusIcon />Buat Order
          </button>
        </div>

        {state.route === 'dashboard' && (
          <DashboardPage orders={state.orders} onOpenOrder={openOrder} onGoOrders={() => nav('orders')} />
        )}

        {state.route === 'customers' && (
          <CustomersPage
            customers={state.customers}
            orders={state.orders}
            search={state.customerSearch}
            onSearch={v => setState(s => ({ ...s, customerSearch: v }))}
            onAddCustomer={c => {
              setState(s => ({ ...s, customers: [c, ...s.customers] }));
              if (userId) persist(async () => { const saved = await db.insertCustomer(userId, c); setState(s => ({ ...s, customers: s.customers.map(x => x.id === c.id ? saved : x) })); });
            }}
            onUpdateCustomer={c => {
              setState(s => ({ ...s, customers: s.customers.map(x => x.id === c.id ? c : x) }));
              persist(() => db.updateCustomer(c));
            }}
            onOpenOrder={openOrder}
            onToast={toast}
          />
        )}

        {state.route === 'batches' && (
          <BatchesPage
            batches={state.batches}
            orders={state.orders}
            onAddBatch={b => {
              const batch = { ...b, feeMode: 'global' as const };
              setState(s => ({ ...s, batches: [...s.batches, batch] }));
              if (userId) persist(async () => { const saved = await db.insertBatch(userId, batch); setState(s => ({ ...s, batches: s.batches.map(x => x.id === batch.id ? saved : x) })); });
            }}
            onToast={toast}
          />
        )}

        {state.route === 'orders' && (
          <OrdersPage orders={state.orders} filter={state.orderFilter} onFilter={f => setState(s => ({ ...s, orderFilter: f }))} onOpenOrder={openOrder} />
        )}

        {state.route === 'create' && (
          <CreateOrderPage
            draft={state.draft}
            batches={state.batches}
            customers={state.customers}
            chatText={state.chatText}
            parsing={state.parsing}
            parsed={state.parsed}
            onChatInput={v => setState(s => ({ ...s, chatText: v }))}
            onParseChat={async () => {
              const chat = state.chatText.trim();
              if (!chat) { toast('Tempel chat customer dulu'); return; }
              setState(s => ({ ...s, parsing: true, parsed: false }));
              try {
                const res = await fetch('/api/parse-chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chatText: chat }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Gagal membaca chat');
                const d = json.data as {
                  name?: string; phone?: string; address?: string; instagram?: string; custNotes?: string;
                  items?: Array<{ productName?: string; brandStore?: string; color?: string; size?: string; qty?: number; priceInIdr?: number }>;
                };
                setState(s => {
                  const draft = {
                    ...s.draft,
                    name: d.name || s.draft.name,
                    phone: d.phone || s.draft.phone,
                    address: d.address || s.draft.address,
                    instagram: d.instagram || s.draft.instagram,
                    custNotes: d.custNotes || s.draft.custNotes,
                    items: Array.isArray(d.items) && d.items.length
                      ? d.items.map(it => ({
                          productName: it.productName || '', brandStore: it.brandStore || '', productLink: '',
                          color: it.color || '', size: it.size || '', qty: it.qty || 1, priceInIdr: it.priceInIdr || 0,
                          jastipFee: 0, localShipping: 0, intlShipping: 0, otherFee: 0, purchaseStatus: 'Menunggu Pembelian' as const,
                        }))
                      : s.draft.items,
                  };
                  return { ...s, parsing: false, parsed: true, draft: applyFeesToDraft(draft, s.globalFee, s.batches) };
                });
                toast('AI selesai membaca chat ✓');
              } catch (e) {
                setState(s => ({ ...s, parsing: false }));
                toast(e instanceof Error ? e.message : 'Gagal membaca chat');
              }
            }}
            onDraftField={(f, v) => setState(s => {
              const draft = { ...s.draft, [f]: v };
              return { ...s, draft: f === 'batchId' ? applyFeesToDraft(draft, s.globalFee, s.batches) : draft };
            })}
            onItemField={(idx, f, v) => setState(s => {
              const items = s.draft.items.map((it, i) => i === idx ? { ...it, [f]: v } : it);
              let draft = { ...s.draft, items };
              if (f === 'priceInIdr' || f === 'qty') draft = applyFeesToDraft(draft, s.globalFee, s.batches);
              return { ...s, draft };
            })}
            onAddItem={() => setState(s => ({ ...s, draft: applyFeesToDraft({ ...s.draft, items: [...s.draft.items, emptyItem()] }, s.globalFee, s.batches) }))}
            onRemoveItem={idx => setState(s => ({ ...s, draft: { ...s.draft, items: s.draft.items.filter((_, i) => i !== idx) } }))}
            onSave={() => {
              if (!state.draft.name || !state.draft.phone) { toast('Nama & No WhatsApp wajib diisi'); return; }
              if (!state.draft.items.length) { toast('Minimal 1 produk'); return; }
              if (state.plan === 'free' && state.orders.length >= FREE_ORDER_LIMIT) { nav('upgrade'); return; }

              const batchName = state.batches.find(b => b.id === state.draft.batchId)?.name || '';
              const totals = calcOrderTotals(state.draft.items);
              const token = Array.from({ length: 11 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
              const maxNo = state.orders.reduce((m, o) => Math.max(m, parseInt(o.invoiceNo.replace(/\D/g, ''), 10) || 0), 0);
              const invoiceNo = 'INV-' + String(maxNo + 1).padStart(6, '0');

              const newOrder: Order = {
                orderId: 'temp-' + Date.now(),
                invoiceNo,
                trackingToken: token,
                customerName: state.draft.name,
                customerPhone: state.draft.phone,
                address: state.draft.address,
                batchId: state.draft.batchId,
                batchName: batchName || '-',
                orderDate: new Date().toISOString().slice(0, 10),
                paidAmount: state.draft.paid || 0,
                dpPercent: state.draft.dpPercent,
                paymentStatus: state.draft.paymentStatus,
                orderStatus: state.draft.orderStatus,
                notes: state.draft.custNotes,
                courier: '', resi: '', shipCost: 0, shipDate: '', shipStatus: 'Belum dikirim', weight: 0,
                items: state.draft.items.map(it => ({ ...it, purchaseStatus: it.purchaseStatus || 'Menunggu Pembelian' as const })),
                payments: (state.draft.paid || 0) > 0 ? [{ date: new Date().toISOString().slice(0, 10), amount: state.draft.paid, method: 'Transfer BCA', type: 'DP' }] : [],
                ...totals,
                remainingAmount: totals.totalAmount - (state.draft.paid || 0),
              };

              // Update customer or create new
              const phone = state.draft.phone.replace(/\D/g, '');
              const existing = state.customers.find(c => c.phone.replace(/\D/g, '') === phone);
              let newCustomers = state.customers;
              if (existing) {
                const updated = { ...existing, name: state.draft.name, address: state.draft.address || existing.address, instagram: state.draft.instagram || existing.instagram };
                newCustomers = state.customers.map(c => c.id === existing.id ? updated : c);
                persist(() => db.updateCustomer(updated));
              } else {
                const newCust = { id: 'temp-c-' + Date.now(), name: state.draft.name, phone: state.draft.phone, address: state.draft.address, instagram: state.draft.instagram };
                newCustomers = [newCust, ...state.customers];
                if (userId) persist(async () => { const saved = await db.insertCustomer(userId, newCust); setState(s => ({ ...s, customers: s.customers.map(x => x.id === newCust.id ? saved : x) })); });
              }

              setState(s => ({ ...s, orders: [newOrder, ...s.orders], customers: newCustomers, draft: { ...initialDraft } }));

              // Persist order to Supabase
              if (userId) persist(async () => {
                const saved = await db.insertOrder(userId, newOrder);
                setState(s => ({ ...s, orders: s.orders.map(o => o.orderId === newOrder.orderId ? saved : o) }));
              });

              toast('Order tersimpan & invoice dibuat ✓');
              setTimeout(() => nav('orders'), 700);
            }}
            onPreviewLink={() => toast('Simpan order dulu untuk membuat link')}
            feeSummary={(() => {
              const b = state.batches.find(x => x.id === state.draft.batchId);
              const cfg = effectiveFeeConfig(b, state.globalFee);
              const src = b?.feeMode === 'custom' ? 'khusus batch ini' : 'global';
              return `${feeConfigSummary(cfg)} · ${src}`;
            })()}
            onAutoFee={() => { setState(s => ({ ...s, draft: applyFeesToDraft(s.draft, s.globalFee, s.batches) })); toast('Fee dihitung ulang ✓'); }}
            onToast={toast}
          />
        )}

        {state.route === 'detail' && curOrder && (
          <OrderDetailPage
            order={curOrder}
            batches={state.batches}
            tab={state.detailTab}
            onSetTab={t => setState(s => ({ ...s, detailTab: t }))}
            payForm={state.payForm}
            onPayFormChange={(f, v) => setState(s => ({ ...s, payForm: { ...s.payForm, [f]: v } }))}
            onAddPayment={() => {
              const amt = +(state.payForm.amount);
              if (!amt) { toast('Isi jumlah bayar'); return; }
              const payment = { date: new Date().toISOString().slice(0, 10), amount: amt, method: state.payForm.method, type: state.payForm.type };
              setState(s => {
                const orders = s.orders.map(o => {
                  if (o.orderId !== s.selectedOrderId) return o;
                  const paidAmount = o.paidAmount + amt;
                  const remainingAmount = o.totalAmount - paidAmount;
                  const paymentStatus = remainingAmount <= 0 ? 'Lunas' : (o.paidAmount === 0 ? 'DP Diterima' : 'Menunggu Pelunasan');
                  return { ...o, paidAmount, remainingAmount, paymentStatus, payments: [...o.payments, payment] };
                });
                return { ...s, orders, payForm: { amount: '', method: 'Transfer BCA', type: 'Pelunasan' } };
              });
              persist(async () => {
                const oid = state.selectedOrderId;
                await db.addPayment(oid, payment);
                const order = state.orders.find(o => o.orderId === oid);
                if (order) {
                  const paidAmount = order.paidAmount + amt;
                  const remainingAmount = order.totalAmount - paidAmount;
                  const paymentStatus = remainingAmount <= 0 ? 'Lunas' : (order.paidAmount === 0 ? 'DP Diterima' : 'Menunggu Pelunasan');
                  await db.updateOrderFields(oid, { paidAmount, remainingAmount, paymentStatus });
                }
              });
              toast('Pembayaran dicatat ✓');
            }}
            onOrderFieldChange={(f, v) => {
              setState(s => {
                const orders = s.orders.map(o => {
                  if (o.orderId !== s.selectedOrderId) return o;
                  if (f === 'orderStatus' && v === 'Dikirim ke Customer' && o.paymentStatus !== 'Lunas') {
                    toast('Tidak bisa dikirim — order belum lunas');
                    return o;
                  }
                  return { ...o, [f]: v };
                });
                return { ...s, orders };
              });
              persist(() => db.updateOrderFields(state.selectedOrderId, { [f]: v }));
            }}
            onShipFieldChange={(f, v) => {
              setState(s => ({
                ...s, orders: s.orders.map(o => o.orderId === s.selectedOrderId ? { ...o, [f]: f === 'shipCost' ? (+v || 0) : v } : o)
              }));
            }}
            onSaveShip={() => {
              const o = state.orders.find(x => x.orderId === state.selectedOrderId);
              if (o) persist(() => db.updateOrderFields(o.orderId, { courier: o.courier, resi: o.resi, shipDate: o.shipDate, shipStatus: o.shipStatus }));
              toast('Data pengiriman disimpan ✓');
            }}
            onOpenTrack={() => setState(s => ({ ...s, trackOrderId: s.selectedOrderId, route: 'track' as Route }))}
            onAddItemToOrder={(item: OrderItem) => {
              setState(s => {
                const orders = s.orders.map(o => {
                  if (o.orderId !== s.selectedOrderId) return o;
                  const batch = s.batches.find(b => b.id === o.batchId);
                  const cfg = effectiveFeeConfig(batch, s.globalFee);
                  const feeVal = calcFeeForItem(cfg, item.priceInIdr, item.qty);
                  const finalItem = feeVal >= 0 ? { ...item, jastipFee: feeVal } : item;
                  const items = [...o.items, finalItem];
                  const totals = calcOrderTotals(items);
                  return { ...o, items, ...totals, remainingAmount: totals.totalAmount - o.paidAmount };
                });
                return { ...s, orders };
              });
              // Persist: replace all items + update totals
              setTimeout(() => {
                const o = state.orders.find(x => x.orderId === state.selectedOrderId);
                if (!o) return;
                persist(async () => {
                  await db.replaceOrderItems(o.orderId, o.items);
                  await db.updateOrderFields(o.orderId, { totalProduct: o.totalProduct, totalFee: o.totalFee, totalLocal: o.totalLocal, totalIntl: o.totalIntl, totalOther: o.totalOther, totalAmount: o.totalAmount, remainingAmount: o.remainingAmount });
                });
              }, 100);
            }}
            onRemoveItemFromOrder={(idx: number) => {
              let updatedOrder: Order | undefined;
              setState(s => {
                const orders = s.orders.map(o => {
                  if (o.orderId !== s.selectedOrderId) return o;
                  const items = o.items.filter((_, i) => i !== idx);
                  const totals = calcOrderTotals(items);
                  const updated = { ...o, items, ...totals, remainingAmount: totals.totalAmount - o.paidAmount };
                  updatedOrder = updated;
                  return updated;
                });
                return { ...s, orders };
              });
              if (updatedOrder) {
                const uo = updatedOrder;
                persist(async () => {
                  await db.replaceOrderItems(uo.orderId, uo.items);
                  await db.updateOrderFields(uo.orderId, { totalProduct: uo.totalProduct, totalFee: uo.totalFee, totalLocal: uo.totalLocal, totalIntl: uo.totalIntl, totalOther: uo.totalOther, totalAmount: uo.totalAmount, remainingAmount: uo.remainingAmount });
                });
              }
              toast('Produk dihapus dari order ✓');
            }}
            onUpdateItemInOrder={(idx: number, item: OrderItem) => {
              let updatedOrder: Order | undefined;
              setState(s => {
                const orders = s.orders.map(o => {
                  if (o.orderId !== s.selectedOrderId) return o;
                  const items = o.items.map((it, i) => i === idx ? item : it);
                  const totals = calcOrderTotals(items);
                  const updated = { ...o, items, ...totals, remainingAmount: totals.totalAmount - o.paidAmount };
                  updatedOrder = updated;
                  return updated;
                });
                return { ...s, orders };
              });
              if (updatedOrder) {
                const uo = updatedOrder;
                persist(async () => {
                  await db.replaceOrderItems(uo.orderId, uo.items);
                  await db.updateOrderFields(uo.orderId, { totalProduct: uo.totalProduct, totalFee: uo.totalFee, totalLocal: uo.totalLocal, totalIntl: uo.totalIntl, totalOther: uo.totalOther, totalAmount: uo.totalAmount, remainingAmount: uo.remainingAmount });
                });
              }
            }}
            onSaveOngkir={(weight: number, shipCost: number) => {
              setState(s => ({
                ...s,
                orders: s.orders.map(o => o.orderId === s.selectedOrderId ? { ...o, weight, shipCost } : o),
              }));
              persist(() => db.updateOrderFields(state.selectedOrderId, { weight, shipCost }));
            }}
            storeName={state.storeName}
            bankInfo={state.bankInfo}
            onToast={toast}
          />
        )}

        {state.route === 'payments' && (
          <PaymentsPage orders={state.orders} />
        )}

        {state.route === 'reports' && (
          <ReportsPage orders={state.orders} batches={state.batches} onToast={toast} />
        )}

        {state.route === 'fees' && (
          <FeesPage
            globalFee={state.globalFee}
            batches={state.batches}
            onSaveGlobal={(cfg: FeeConfig) => {
              setState(s => ({ ...s, globalFee: cfg, draft: applyFeesToDraft(s.draft, cfg, s.batches) }));
              if (userId) persist(() => db.updateProfile(userId, { fee_config: cfg }));
            }}
            onSaveBatch={(batchId, mode, cfg) => {
              setState(s => {
                const batches = s.batches.map(b => b.id === batchId ? { ...b, feeMode: mode, feeConfig: mode === 'custom' ? cfg : undefined } : b);
                return { ...s, batches, draft: applyFeesToDraft(s.draft, s.globalFee, batches) };
              });
              persist(() => db.updateBatchFee(batchId, mode, cfg));
            }}
            onToast={toast}
          />
        )}

        {state.route === 'templates' && (
          <TemplatesPage onToast={toast} />
        )}

        {state.route === 'upgrade' && (
          <UpgradePage
            plan={state.plan}
            orderCount={state.orders.length}
            upgradeStatus={state.upgradeStatus}
            upgradeCode={state.upgradeCode}
            onConfirmTransfer={() => {
              setState(s => ({ ...s, upgradeStatus: 'pending' }));
              if (userId) persist(() => db.updateProfile(userId, { upgrade_status: 'pending' }));
              toast('Konfirmasi transfer terkirim — menunggu verifikasi admin');
            }}
            onToast={toast}
          />
        )}

        {state.route === 'store-settings' && (
          <StoreSettingsPage
            storeName={state.storeName}
            bankInfo={state.bankInfo}
            onSave={(storeName, bankInfo) => {
              setState(s => ({ ...s, storeName, bankInfo }));
              if (userId) persist(() => db.updateProfile(userId, { store_name: storeName, bank_info: bankInfo }));
            }}
            onToast={toast}
          />
        )}

        {state.route === 'admin' && userEmail === SUPER_ADMIN_EMAIL && (
          <SuperAdminPage onToast={toast} />
        )}
      </main>

      <BottomNav route={state.route} onNav={nav} userEmail={userEmail} onLogout={handleLogout} />
      <Toast message={state.toast} />
    </div>
  );
}
