import { OrderItem, Order, Batch, Draft, FeeConfig } from './types';

export function rp(n: number): string {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

export function dt(s: string): string {
  if (!s) return '-';
  const [y, m, d] = s.split('-');
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${+d} ${mo[+m - 1]} ${y}`;
}

export function waLink(phone: string, text?: string): string {
  let p = (phone || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  return `https://wa.me/${p}?text=${encodeURIComponent(text || '')}`;
}

export function itemSubtotal(it: OrderItem): number {
  return it.priceInIdr * it.qty + it.jastipFee + (it.localShipping || 0) + (it.intlShipping || 0) + (it.otherFee || 0);
}

export function calcOrderTotals(items: OrderItem[]) {
  const totalProduct = items.reduce((s, i) => s + i.priceInIdr * i.qty, 0);
  const totalFee = items.reduce((s, i) => s + i.jastipFee, 0);
  const totalLocal = items.reduce((s, i) => s + (i.localShipping || 0), 0);
  const totalIntl = items.reduce((s, i) => s + (i.intlShipping || 0), 0);
  const totalOther = items.reduce((s, i) => s + (i.otherFee || 0), 0);
  const totalAmount = totalProduct + totalFee + totalLocal + totalIntl + totalOther;
  return { totalProduct, totalFee, totalLocal, totalIntl, totalOther, totalAmount };
}

export function payBadge(s: string): [string, string] {
  const m: Record<string, [string, string]> = {
    'Lunas': ['#dcfce7', '#15803d'],
    'DP Diterima': ['#dbeafe', '#1d4ed8'],
    'Menunggu DP': ['#fef3c7', '#b45309'],
    'Menunggu Pelunasan': ['#ffedd5', '#c2410c'],
    'Refund': ['#fee2e2', '#b91c1c'],
  };
  return m[s] || ['#f1f5f9', '#475569'];
}

export function ordBadge(s: string): [string, string] {
  if (s === 'Selesai') return ['#dcfce7', '#15803d'];
  if (s === 'Cancel/Refund') return ['#fee2e2', '#b91c1c'];
  if (s === 'Dikirim ke Customer' || s === 'Siap Dikirim') return ['#dbeafe', '#1d4ed8'];
  if (s === 'Menunggu DP' || s === 'Menunggu Pelunasan') return ['#fef3c7', '#b45309'];
  return ['#fff7ed', '#c2410c'];
}

export function buildSteps(status: string, dpPercent: number) {
  const isDP = dpPercent < 100;

  const dpLabels = [
    'Order diterima', 'Menunggu DP', 'DP diterima', 'Menunggu pelunasan', 'Lunas',
    'Menunggu pembelian', 'Barang sudah dibeli', 'Siap dikirim', 'Dikirim ke customer', 'Selesai'
  ];
  const dpMap: Record<string, number> = {
    'Menunggu DP': 1, 'DP Diterima': 2, 'Menunggu Pelunasan': 3, 'Lunas': 4,
    'Menunggu Pembelian': 5, 'Sudah Dibeli': 6,
    'Siap Dikirim': 7, 'Dikirim ke Customer': 8, 'Selesai': 9, 'Cancel/Refund': 99
  };

  const lunasLabels = [
    'Order diterima', 'Menunggu pelunasan', 'Lunas',
    'Menunggu pembelian', 'Barang sudah dibeli', 'Siap dikirim', 'Dikirim ke customer', 'Selesai'
  ];
  const lunasMap: Record<string, number> = {
    'Menunggu Pelunasan': 1, 'Lunas': 2,
    'Menunggu Pembelian': 3, 'Sudah Dibeli': 4,
    'Siap Dikirim': 5, 'Dikirim ke Customer': 6, 'Selesai': 7, 'Cancel/Refund': 99
  };

  const labels = isDP ? dpLabels : lunasLabels;
  const map = isDP ? dpMap : lunasMap;
  const cur = map[status] ?? 0;
  const isCancelled = status === 'Cancel/Refund';

  return labels.map((l, i) => {
    const done = isCancelled ? false : i < cur;
    const now = isCancelled ? false : i === cur;
    return {
      label: isCancelled && i === 0 ? 'Cancel / Refund' : l,
      sub: isCancelled ? (i === 0 ? 'Dibatalkan' : '-') : (done ? 'Selesai' : (now ? 'Sedang berjalan' : 'Menunggu')),
      icon: isCancelled ? (i === 0 ? '✕' : '○') : (done ? '✓' : (now ? '●' : '○')),
      dotBg: isCancelled ? (i === 0 ? '#ef4444' : '#fff') : (done ? '#16a34a' : (now ? '#eef2ff' : '#fff')),
      dotColor: isCancelled ? (i === 0 ? '#fff' : '#cbd5e1') : (done ? '#fff' : (now ? '#4f46e5' : '#cbd5e1')),
      dotBorder: isCancelled ? (i === 0 ? '#ef4444' : '#e2e8f0') : (done ? '#16a34a' : (now ? '#4f46e5' : '#e2e8f0')),
      lineColor: isCancelled ? '#e2e8f0' : (i < cur ? '#16a34a' : '#e2e8f0'),
      textColor: isCancelled ? (i === 0 ? '#b91c1c' : '#94a3b8') : ((done || now) ? '#0f172a' : '#94a3b8'),
    };
  });
}

export function autoOrderStatus(order: Order): { orderStatus: string; paymentStatus: string } {
  let { orderStatus, paymentStatus } = order;
  const allBought = order.items.length > 0 && order.items.every(it => it.purchaseStatus === 'Sudah Dibeli');

  if (orderStatus === 'Cancel/Refund' || orderStatus === 'Selesai' || orderStatus === 'Dikirim ke Customer') {
    return { orderStatus, paymentStatus };
  }

  if (order.remainingAmount <= 0 && order.paidAmount > 0) {
    paymentStatus = 'Lunas';
    if (allBought) {
      orderStatus = 'Sudah Dibeli';
    } else {
      orderStatus = 'Menunggu Pembelian';
    }
  } else if (order.paidAmount > 0 && order.remainingAmount > 0) {
    if (order.dpPercent >= 100) {
      paymentStatus = 'Menunggu Pelunasan';
      orderStatus = 'Menunggu Pelunasan';
    } else {
      paymentStatus = order.paidAmount >= Math.round(order.totalAmount * order.dpPercent / 100) ? 'Menunggu Pelunasan' : 'DP Diterima';
      orderStatus = paymentStatus === 'Menunggu Pelunasan' ? 'Menunggu Pelunasan' : 'DP Diterima';
    }
  }

  if (paymentStatus === 'Lunas' && allBought) {
    orderStatus = 'Sudah Dibeli';
  } else if (paymentStatus === 'Lunas' && !allBought) {
    orderStatus = 'Menunggu Pembelian';
  }

  return { orderStatus, paymentStatus };
}

export function buildInvoiceText(o: Order, storeName: string, bankInfo: string): string {
  const lines = o.items.map((it, i) =>
    `${i + 1}. ${it.productName} ${it.color !== '-' ? it.color : ''} ${it.size !== '-' ? it.size : ''}\n   Qty: ${it.qty}\n   Harga: ${rp(it.priceInIdr)}\n   Fee Jastip: ${rp(it.jastipFee)}`
  ).join('\n');
  const subtotal = o.totalAmount - (o.shipCost || 0);
  const ongkirLine = o.shipCost ? `\nOngkir: ${rp(o.shipCost)}` : '';
  return `Halo Kak ${o.customerName}, berikut invoice order jastip kamu:\n\nInvoice: ${o.invoiceNo}\nBatch: ${o.batchName}\n\nProduk:\n${lines}\n\nSubtotal Barang: ${rp(subtotal)}${ongkirLine}\nTotal Order: ${rp(o.totalAmount)}\nSudah Dibayar: ${rp(o.paidAmount)}\nSisa Pelunasan: ${rp(o.remainingAmount)}\n\nPembayaran:\n${bankInfo}\n\nCatatan:\nOrder yang sudah dibelikan tidak bisa dibatalkan.\nPelunasan wajib dilakukan sebelum barang dikirim.`;
}

export const PAY_STATUSES = ['Menunggu DP', 'DP Diterima', 'Menunggu Pelunasan', 'Lunas', 'Refund'];
export const ORDER_STATUSES = ['Menunggu DP', 'DP Diterima', 'Menunggu Pelunasan', 'Lunas', 'Menunggu Pembelian', 'Sudah Dibeli', 'Siap Dikirim', 'Dikirim ke Customer', 'Selesai', 'Cancel/Refund'];

export function emptyItem(): OrderItem {
  return { productName: '', brandStore: '', productLink: '', color: '', size: '', qty: 1, priceInIdr: 0, jastipFee: 0, localShipping: 0, intlShipping: 0, otherFee: 0, purchaseStatus: 'Menunggu Pembelian' };
}

// ===== Fee jastip =====
export function defaultFeeConfig(): FeeConfig {
  return {
    type: 'tier',
    flatFee: 50000,
    percent: 10,
    percentMin: 50000,
    tiers: [
      { from: 0, upTo: 500000, fee: 50000, isPercent: false },
      { from: 500001, upTo: 1000000, fee: 75000, isPercent: false },
      { from: 1000001, upTo: 0, fee: 10, isPercent: true },
    ],
  };
}

// Pilih config yang berlaku untuk sebuah batch: pakai milik batch jika feeMode 'custom', selain itu global.
export function effectiveFeeConfig(batch: Batch | undefined, globalFee: FeeConfig): FeeConfig {
  if (batch?.feeMode === 'custom' && batch.feeConfig) return batch.feeConfig;
  return globalFee;
}

// Hitung fee jastip untuk 1 baris produk (sudah termasuk qty). Mengembalikan -1 jika mode custom (jangan diubah otomatis).
export function calcFeeForItem(config: FeeConfig, unitPrice: number, qty: number): number {
  const q = qty || 0;
  if (q <= 0) return config.type === 'custom' ? -1 : 0;
  const lineValue = (unitPrice || 0) * q;
  switch (config.type) {
    case 'flat':
      return (config.flatFee || 0) * q;
    case 'percent':
      return Math.max(config.percentMin || 0, Math.round(lineValue * (config.percent || 0) / 100));
    case 'tier': {
      const tiers = config.tiers || [];
      const match = tiers.find(t => unitPrice >= t.from && (t.upTo === 0 ? true : unitPrice <= t.upTo))
        || tiers.find(t => t.upTo === 0)
        || tiers[tiers.length - 1];
      if (!match) return 0;
      return match.isPercent ? Math.round(lineValue * match.fee / 100) : (match.fee || 0) * q;
    }
    case 'custom':
    default:
      return -1;
  }
}

// Isi ulang jastipFee semua item draft sesuai fee config batch yang dipilih (atau global). Mode custom dibiarkan manual.
export function applyFeesToDraft(draft: Draft, globalFee: FeeConfig, batches: Batch[]): Draft {
  const batch = batches.find(b => b.id === draft.batchId);
  const config = effectiveFeeConfig(batch, globalFee);
  if (config.type === 'custom') return draft;
  return {
    ...draft,
    items: draft.items.map(it => {
      const fee = calcFeeForItem(config, it.priceInIdr, it.qty);
      return fee < 0 ? it : { ...it, jastipFee: fee };
    }),
  };
}

export function feeConfigSummary(c: FeeConfig): string {
  switch (c.type) {
    case 'flat': return `Flat Rp${(c.flatFee || 0).toLocaleString('id-ID')} / item`;
    case 'percent': return `${c.percent || 0}% dari harga (min Rp${(c.percentMin || 0).toLocaleString('id-ID')})`;
    case 'tier': return `Tier harga · ${c.tiers.length} tingkat`;
    case 'custom': return 'Manual per item';
    default: return '-';
  }
}

export function maskName(n: string): string {
  return n.split(' ').map(w => w[0] + '*'.repeat(Math.max(1, w.length - 1))).join(' ');
}

export function maskPhone(p: string): string {
  return p.slice(0, 4) + '****' + p.slice(-2);
}

export function copyText(t: string) {
  try { navigator.clipboard?.writeText(t); } catch { /* noop */ }
}
