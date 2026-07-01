import { Customer, Batch, Order, OrderItem, Draft, Route, DetailTab, Plan, UpgradeStatus, FeeConfig } from './types';
import { calcOrderTotals, defaultFeeConfig } from './utils';

// ===== Freemium config =====
export const FREE_ORDER_LIMIT = 10;
export const PRO_PRICE = 99000;

function mkOrder(o: Omit<Order, 'totalProduct' | 'totalFee' | 'totalLocal' | 'totalIntl' | 'totalOther' | 'totalAmount' | 'remainingAmount'> & { items: OrderItem[]; paidAmount: number }): Order {
  const totals = calcOrderTotals(o.items);
  return { ...o, ...totals, remainingAmount: totals.totalAmount - o.paidAmount };
}

export const STORE_NAME = 'Toko Jastip Kamu';
export const BANK_INFO = 'BCA 123456789 a/n Owner Jastip';

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Rina Pratiwi', phone: '081234567890', address: 'Bogor', instagram: '@rinaprtw' },
  { id: 'c2', name: 'Siska Amelia', phone: '082112223333', address: 'Jakarta Selatan', instagram: '@siska.amelia' },
  { id: 'c3', name: 'Maya Putri', phone: '085677788899', address: 'Depok', instagram: '@mayaputri' },
  { id: 'c4', name: 'Intan Sari', phone: '081399988877', address: 'Tangerang', instagram: '@intans' },
];

export const initialBatches: Batch[] = [
  { id: 'b1', name: 'Jastip Bangkok Juli 2026', place: 'Bangkok, Thailand', start: '2026-07-01', end: '2026-07-08', arrival: '2026-07-15', status: 'Open', notes: 'Fokus fashion & bag' },
  { id: 'b2', name: 'Jastip Singapore Weekend', place: 'Singapore', start: '2026-07-19', end: '2026-07-21', arrival: '2026-07-26', status: 'Draft', notes: '' },
  { id: 'b3', name: 'Jastip Japan Skincare Agustus 2026', place: 'Tokyo, Japan', start: '2026-08-05', end: '2026-08-12', arrival: '2026-08-20', status: 'Open', notes: 'Skincare & kosmetik' },
];

export const initialOrders: Order[] = [
  mkOrder({
    orderId: 'o1', invoiceNo: 'INV-000123', trackingToken: 'x8K29LmPq72',
    customerName: 'Rina Pratiwi', customerPhone: '081234567890', address: 'Bogor',
    batchId: 'b1', batchName: 'Jastip Bangkok Juli 2026', orderDate: '2026-06-20',
    paidAmount: 310000, dpPercent: 50, paymentStatus: 'DP Diterima', orderStatus: 'Sudah Dibeli',
    notes: 'Customer minta dikabari kalau warna sold out.',
    courier: '', resi: '', shipCost: 0, shipDate: '', shipStatus: 'Belum dikirim', weight: 0,
    items: [{ productName: 'Zara Dress', brandStore: 'Zara', productLink: '', color: 'Black', size: 'M', qty: 1, priceInIdr: 499000, jastipFee: 75000, localShipping: 21000, intlShipping: 25000, otherFee: 0, purchaseStatus: 'Sudah Dibeli' as const }],
    payments: [{ date: '2026-06-20', amount: 310000, method: 'Transfer BCA', type: 'DP' }],
  }),
  mkOrder({
    orderId: 'o2', invoiceNo: 'INV-000124', trackingToken: 'a3F8kZ1Qw90',
    customerName: 'Siska Amelia', customerPhone: '082112223333', address: 'Jakarta Selatan',
    batchId: 'b1', batchName: 'Jastip Bangkok Juli 2026', orderDate: '2026-06-18',
    paidAmount: 725000, dpPercent: 50, paymentStatus: 'Menunggu Pelunasan', orderStatus: 'Barang Tiba',
    notes: 'Barang sudah sampai ke admin, menunggu pelunasan.',
    courier: '', resi: '', shipCost: 0, shipDate: '', shipStatus: 'Belum dikirim', weight: 0,
    items: [{ productName: 'Charles & Keith Bag', brandStore: 'Charles & Keith', productLink: '', color: 'Beige', size: '-', qty: 1, priceInIdr: 1250000, jastipFee: 125000, localShipping: 35000, intlShipping: 40000, otherFee: 0, purchaseStatus: 'Sudah Dibeli' as const }],
    payments: [{ date: '2026-06-18', amount: 725000, method: 'Transfer BCA', type: 'DP' }],
  }),
  mkOrder({
    orderId: 'o3', invoiceNo: 'INV-000125', trackingToken: 'p7N4rT6Yb15',
    customerName: 'Maya Putri', customerPhone: '085677788899', address: 'Depok',
    batchId: 'b3', batchName: 'Jastip Japan Skincare Agustus 2026', orderDate: '2026-06-23',
    paidAmount: 0, dpPercent: 50, paymentStatus: 'Menunggu DP', orderStatus: 'Menunggu DP',
    notes: 'Menunggu transfer DP dari customer.',
    courier: '', resi: '', shipCost: 0, shipDate: '', shipStatus: 'Belum dikirim', weight: 0,
    items: [{ productName: 'Uniqlo Shirt', brandStore: 'Uniqlo', productLink: '', color: 'White', size: 'L', qty: 1, priceInIdr: 349000, jastipFee: 50000, localShipping: 0, intlShipping: 0, otherFee: 0, purchaseStatus: 'Menunggu Pembelian' as const }],
    payments: [],
  }),
  mkOrder({
    orderId: 'o4', invoiceNo: 'INV-000126', trackingToken: 'm5W2cV8Hn33',
    customerName: 'Intan Sari', customerPhone: '081399988877', address: 'Tangerang',
    batchId: 'b3', batchName: 'Jastip Japan Skincare Agustus 2026', orderDate: '2026-06-15',
    paidAmount: 980000, dpPercent: 50, paymentStatus: 'Lunas', orderStatus: 'Dikirim ke Customer',
    notes: 'Sudah lunas & dikirim. Mohon konfirmasi jika sudah diterima.',
    courier: 'JNE', resi: 'JNE0099887766', shipCost: 22000, shipDate: '2026-06-24', shipStatus: 'Dikirim', weight: 1200,
    items: [{ productName: 'Skincare Japan Set', brandStore: 'Matsumoto', productLink: '', color: '-', size: '-', qty: 1, priceInIdr: 850000, jastipFee: 85000, localShipping: 20000, intlShipping: 25000, otherFee: 0, purchaseStatus: 'Sudah Dibeli' as const }],
    payments: [{ date: '2026-06-15', amount: 490000, method: 'QRIS', type: 'DP' }, { date: '2026-06-22', amount: 490000, method: 'Transfer BCA', type: 'Pelunasan' }],
  }),
];

export const initialDraft: Draft = {
  name: '', phone: '', address: '', instagram: '', custNotes: '', batchId: '', dpPercent: 50, paid: 0,
  paymentStatus: 'Menunggu DP', orderStatus: 'Menunggu DP', items: [],
};

export interface AppState {
  authed: boolean;
  route: Route;
  selectedOrderId: string;
  trackOrderId: string;
  detailTab: DetailTab;
  orderFilter: string;
  customerSearch: string;
  toast: string;
  parsing: boolean;
  parsed: boolean;
  chatText: string;
  draft: Draft;
  payForm: { amount: string; method: string; type: string };
  globalFee: FeeConfig;
  customers: Customer[];
  batches: Batch[];
  orders: Order[];
  // toko
  storeName: string;
  bankInfo: string;
  // freemium
  plan: Plan;
  upgradeStatus: UpgradeStatus;
  upgradeCode: string;
  proStartDate: string;
  proEndDate: string;
}

export const initialState: AppState = {
  authed: false,
  route: 'dashboard',
  selectedOrderId: 'o2',
  trackOrderId: 'o2',
  detailTab: 'produk',
  orderFilter: 'Semua',
  customerSearch: '',
  toast: '',
  parsing: false,
  parsed: false,
  chatText: 'Kak aku mau ikut jastip Bangkok ya. Nama Rina, no hp 08123456789. Mau order Zara Dress warna black size M qty 1 harga 499.000. Alamat Bogor.',
  draft: { ...initialDraft },
  payForm: { amount: '', method: 'Transfer BCA', type: 'Pelunasan' },
  globalFee: defaultFeeConfig(),
  customers: initialCustomers,
  batches: initialBatches,
  orders: initialOrders,
  storeName: STORE_NAME,
  bankInfo: BANK_INFO,
  plan: 'free',
  upgradeStatus: 'none',
  upgradeCode: String(Math.floor(100 + Math.random() * 900)),
  proStartDate: '',
  proEndDate: '',
};
