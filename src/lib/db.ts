import { supabase } from './supabase';
import { Customer, Batch, Order, OrderItem, Payment, FeeConfig } from './types';

// ===== Auth =====

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(cb: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => cb(session));
}

// ===== Profile =====

export interface Profile {
  id: string;
  email: string;
  store_name: string;
  bank_info: string;
  plan: string;
  upgrade_status: string;
  upgrade_sender_name: string;
  upgrade_amount: number;
  upgrade_code: string;
  fee_config: FeeConfig;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

// ===== Customers =====

function rowToCustomer(r: Record<string, unknown>): Customer {
  return { id: r.id as string, name: r.name as string, phone: r.phone as string, address: (r.address || '') as string, instagram: (r.instagram || '') as string };
}

export async function getCustomers(ownerId: string): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToCustomer);
}

export async function insertCustomer(ownerId: string, c: Customer): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert({ owner_id: ownerId, name: c.name, phone: c.phone, address: c.address, instagram: c.instagram }).select().single();
  if (error) throw error;
  return rowToCustomer(data);
}

export async function updateCustomer(c: Customer) {
  const { error } = await supabase.from('customers').update({ name: c.name, phone: c.phone, address: c.address, instagram: c.instagram }).eq('id', c.id);
  if (error) throw error;
}

// ===== Batches =====

function rowToBatch(r: Record<string, unknown>): Batch {
  return {
    id: r.id as string, name: r.name as string, place: (r.place || '') as string,
    start: (r.start_date || '') as string, end: (r.end_date || '') as string, arrival: (r.arrival || '') as string,
    status: (r.status || 'Draft') as string, notes: (r.notes || '') as string,
    feeMode: (r.fee_mode || 'global') as 'global' | 'custom',
    feeConfig: r.fee_config as FeeConfig | undefined,
  };
}

export async function getBatches(ownerId: string): Promise<Batch[]> {
  const { data, error } = await supabase.from('batches').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToBatch);
}

export async function insertBatch(ownerId: string, b: Batch): Promise<Batch> {
  const payload = {
    owner_id: ownerId, name: b.name, place: b.place, start_date: b.start, end_date: b.end,
    arrival: b.arrival, status: b.status, notes: b.notes, fee_mode: b.feeMode || 'global', fee_config: b.feeConfig || null,
  };
  console.log('insertBatch payload:', payload);
  const { data, error } = await supabase.from('batches').insert(payload).select().single();
  if (error) { console.error('insertBatch error:', error.message, error.code, error.details); throw error; }
  return rowToBatch(data);
}

export async function updateBatchFee(batchId: string, feeMode: 'global' | 'custom', feeConfig: FeeConfig) {
  const { error } = await supabase.from('batches').update({ fee_mode: feeMode, fee_config: feeMode === 'custom' ? feeConfig : null }).eq('id', batchId);
  if (error) throw error;
}

// ===== Orders =====

function rowToOrder(r: Record<string, unknown>, items: OrderItem[], payments: Payment[]): Order {
  return {
    orderId: r.id as string, invoiceNo: r.invoice_no as string, trackingToken: r.tracking_token as string,
    customerName: r.customer_name as string, customerPhone: r.customer_phone as string, address: (r.address || '') as string,
    batchId: (r.batch_id || '') as string, batchName: (r.batch_name || '') as string, orderDate: r.order_date as string,
    paidAmount: (r.paid_amount || 0) as number, dpPercent: (r.dp_percent || 50) as number,
    paymentStatus: r.payment_status as string, orderStatus: r.order_status as string,
    notes: (r.notes || '') as string, courier: (r.courier || '') as string, resi: (r.resi || '') as string,
    shipCost: (r.ship_cost || 0) as number, shipDate: (r.ship_date || '') as string,
    shipStatus: (r.ship_status || 'Belum dikirim') as string, weight: (r.weight || 0) as number,
    items, payments,
    totalProduct: (r.total_product || 0) as number, totalFee: (r.total_fee || 0) as number,
    totalLocal: (r.total_local || 0) as number, totalIntl: (r.total_intl || 0) as number,
    totalOther: (r.total_other || 0) as number, totalAmount: (r.total_amount || 0) as number,
    remainingAmount: (r.remaining_amount || 0) as number,
  };
}

function rowToItem(r: Record<string, unknown>): OrderItem {
  return {
    productName: r.product_name as string, brandStore: (r.brand_store || '') as string,
    productLink: (r.product_link || '') as string, color: (r.color || '') as string, size: (r.size || '') as string,
    qty: (r.qty || 1) as number, priceInIdr: (r.price_in_idr || 0) as number, jastipFee: (r.jastip_fee || 0) as number,
    localShipping: (r.local_shipping || 0) as number, intlShipping: (r.intl_shipping || 0) as number,
    otherFee: (r.other_fee || 0) as number,
    purchaseStatus: (r.purchase_status || 'Menunggu Pembelian') as OrderItem['purchaseStatus'],
  };
}

function rowToPayment(r: Record<string, unknown>): Payment {
  return { date: r.date as string, amount: r.amount as number, method: r.method as string, type: r.type as string };
}

export async function getOrders(ownerId: string): Promise<Order[]> {
  const { data: orderRows, error } = await supabase
    .from('orders').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  if (!orderRows || orderRows.length === 0) return [];

  const orderIds = orderRows.map(o => o.id);
  const [itemsRes, paymentsRes] = await Promise.all([
    supabase.from('order_items').select('*').in('order_id', orderIds).order('sort_order'),
    supabase.from('payments').select('*').in('order_id', orderIds).order('created_at'),
  ]);

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const r of (itemsRes.data || [])) {
    const list = itemsByOrder.get(r.order_id) || [];
    list.push(rowToItem(r));
    itemsByOrder.set(r.order_id, list);
  }

  const paymentsByOrder = new Map<string, Payment[]>();
  for (const r of (paymentsRes.data || [])) {
    const list = paymentsByOrder.get(r.order_id) || [];
    list.push(rowToPayment(r));
    paymentsByOrder.set(r.order_id, list);
  }

  return orderRows.map(r => rowToOrder(r, itemsByOrder.get(r.id) || [], paymentsByOrder.get(r.id) || []));
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data: row, error } = await supabase.from('orders').select('*').eq('tracking_token', token).single();
  if (error || !row) return null;
  const [itemsRes, paymentsRes] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', row.id).order('sort_order'),
    supabase.from('payments').select('*').eq('order_id', row.id).order('created_at'),
  ]);
  return rowToOrder(row, (itemsRes.data || []).map(rowToItem), (paymentsRes.data || []).map(rowToPayment));
}

export async function insertOrder(ownerId: string, o: Order): Promise<Order> {
  const { data: row, error } = await supabase.from('orders').insert({
    owner_id: ownerId, invoice_no: o.invoiceNo, tracking_token: o.trackingToken,
    customer_name: o.customerName, customer_phone: o.customerPhone, address: o.address,
    batch_id: o.batchId || null, batch_name: o.batchName, order_date: o.orderDate,
    paid_amount: o.paidAmount, dp_percent: o.dpPercent, payment_status: o.paymentStatus,
    order_status: o.orderStatus, notes: o.notes,
    courier: o.courier, resi: o.resi, ship_cost: o.shipCost, ship_date: o.shipDate,
    ship_status: o.shipStatus, weight: o.weight,
    total_product: o.totalProduct, total_fee: o.totalFee, total_local: o.totalLocal,
    total_intl: o.totalIntl, total_other: o.totalOther, total_amount: o.totalAmount,
    remaining_amount: o.remainingAmount,
  }).select().single();
  if (error) throw error;

  const orderId = row.id as string;

  if (o.items.length > 0) {
    const { error: itemErr } = await supabase.from('order_items').insert(
      o.items.map((it, i) => ({
        order_id: orderId, product_name: it.productName, brand_store: it.brandStore,
        product_link: it.productLink, color: it.color, size: it.size, qty: it.qty,
        price_in_idr: it.priceInIdr, jastip_fee: it.jastipFee, local_shipping: it.localShipping,
        intl_shipping: it.intlShipping, other_fee: it.otherFee, purchase_status: it.purchaseStatus,
        sort_order: i,
      }))
    );
    if (itemErr) throw itemErr;
  }

  if (o.payments.length > 0) {
    const { error: payErr } = await supabase.from('payments').insert(
      o.payments.map(p => ({ order_id: orderId, date: p.date, amount: p.amount, method: p.method, type: p.type }))
    );
    if (payErr) throw payErr;
  }

  return { ...o, orderId };
}

export async function updateOrderFields(orderId: string, fields: Record<string, unknown>) {
  const dbFields: Record<string, unknown> = {};
  const map: Record<string, string> = {
    paymentStatus: 'payment_status', orderStatus: 'order_status', paidAmount: 'paid_amount',
    remainingAmount: 'remaining_amount', courier: 'courier', resi: 'resi', shipCost: 'ship_cost',
    shipDate: 'ship_date', shipStatus: 'ship_status', weight: 'weight', notes: 'notes',
    totalProduct: 'total_product', totalFee: 'total_fee', totalLocal: 'total_local',
    totalIntl: 'total_intl', totalOther: 'total_other', totalAmount: 'total_amount',
  };
  for (const [k, v] of Object.entries(fields)) {
    dbFields[map[k] || k] = v;
  }
  const { error } = await supabase.from('orders').update(dbFields).eq('id', orderId);
  if (error) throw error;
}

export async function addPayment(orderId: string, p: Payment) {
  const { error } = await supabase.from('payments').insert({ order_id: orderId, date: p.date, amount: p.amount, method: p.method, type: p.type });
  if (error) throw error;
}

export async function replaceOrderItems(orderId: string, items: OrderItem[]) {
  await supabase.from('order_items').delete().eq('order_id', orderId);
  if (items.length > 0) {
    const { error } = await supabase.from('order_items').insert(
      items.map((it, i) => ({
        order_id: orderId, product_name: it.productName, brand_store: it.brandStore,
        product_link: it.productLink, color: it.color, size: it.size, qty: it.qty,
        price_in_idr: it.priceInIdr, jastip_fee: it.jastipFee, local_shipping: it.localShipping,
        intl_shipping: it.intlShipping, other_fee: it.otherFee, purchase_status: it.purchaseStatus,
        sort_order: i,
      }))
    );
    if (error) throw error;
  }
}

// ===== Invoice sequence =====

export async function getNextInvoiceNo(ownerId: string): Promise<string> {
  const { data } = await supabase.from('orders').select('invoice_no').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(1);
  const last = data?.[0]?.invoice_no || 'INV-000000';
  const num = parseInt(last.replace(/\D/g, ''), 10) || 0;
  return 'INV-' + String(num + 1).padStart(6, '0');
}
