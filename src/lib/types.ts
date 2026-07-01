export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  instagram: string;
}

export interface OrderItem {
  productName: string;
  brandStore: string;
  productLink: string;
  color: string;
  size: string;
  qty: number;
  priceInIdr: number;
  jastipFee: number;
  localShipping: number;
  intlShipping: number;
  otherFee: number;
  purchaseStatus: 'Menunggu Pembelian' | 'Sudah Dibeli';
}

export interface Payment {
  date: string;
  amount: number;
  method: string;
  type: string;
}

export interface Order {
  orderId: string;
  invoiceNo: string;
  trackingToken: string;
  customerName: string;
  customerPhone: string;
  address: string;
  batchId: string;
  batchName: string;
  orderDate: string;
  paidAmount: number;
  dpPercent: number;
  paymentStatus: string;
  orderStatus: string;
  notes: string;
  courier: string;
  resi: string;
  shipCost: number;
  shipDate: string;
  shipStatus: string;
  weight: number;
  items: OrderItem[];
  payments: Payment[];
  totalProduct: number;
  totalFee: number;
  totalLocal: number;
  totalIntl: number;
  totalOther: number;
  totalAmount: number;
  remainingAmount: number;
}

export type FeeType = 'flat' | 'percent' | 'tier' | 'custom';

export interface FeeTier {
  from: number;       // batas bawah harga barang (Rp)
  upTo: number;       // batas atas harga barang (Rp); 0 = "ke atas" (tak terbatas)
  fee: number;        // nilai fee
  isPercent: boolean; // true = persen dari nilai barang, false = Rupiah
}

export interface FeeConfig {
  type: FeeType;
  flatFee: number;
  percent: number;
  percentMin: number;
  tiers: FeeTier[];
}

export interface Batch {
  id: string;
  name: string;
  place: string;
  start: string;
  end: string;
  arrival: string;
  status: string;
  notes: string;
  feeMode?: 'global' | 'custom'; // default 'global' (ikut setting fee global)
  feeConfig?: FeeConfig;         // dipakai jika feeMode === 'custom'
}

export interface Draft {
  name: string;
  phone: string;
  address: string;
  instagram: string;
  custNotes: string;
  batchId: string;
  dpPercent: number;
  paid: number;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
}

export type Route = 'dashboard' | 'customers' | 'batches' | 'orders' | 'create' | 'detail' | 'payments' | 'reports' | 'fees' | 'templates' | 'track' | 'upgrade' | 'admin' | 'store-settings' | 'feedback';

export type DetailTab = 'produk' | 'bayar' | 'timeline' | 'invoice' | 'link' | 'resi';

export type Plan = 'free' | 'pro';
export type UpgradeStatus = 'none' | 'pending' | 'active';
