import { Order } from './types';
import { rp, dt, itemSubtotal } from './utils';

export async function downloadInvoicePdf(o: Order, storeName: string, bankInfo: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  const indigo: [number, number, number] = [79, 70, 229];
  const dark: [number, number, number] = [30, 27, 75];
  const gray: [number, number, number] = [100, 116, 139];

  // header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...dark);
  doc.text(storeName, marginX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text('Invoice Jastip', marginX, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...indigo);
  doc.text(o.invoiceNo, pageW - marginX, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(dt(o.orderDate), pageW - marginX, y + 16, { align: 'right' });

  y += 34;
  doc.setDrawColor(...dark);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageW - marginX, y);
  y += 24;

  // recipient
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kepada: `, marginX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(o.customerName, marginX + 48, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(`Batch: ${o.batchName}`, marginX, y);
  y += 26;

  // items table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text('PRODUK', marginX, y);
  doc.text('QTY', pageW - marginX - 200, y, { align: 'right' });
  doc.text('HARGA', pageW - marginX - 110, y, { align: 'right' });
  doc.text('SUBTOTAL', pageW - marginX, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageW - marginX, y);
  y += 18;

  // items
  doc.setTextColor(15, 23, 42);
  o.items.forEach(it => {
    const meta = [it.brandStore, it.color !== '-' ? it.color : null, it.size !== '-' ? it.size : null].filter(Boolean).join(' · ');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(it.productName, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    if (meta) doc.text(meta, marginX, y + 12);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(String(it.qty), pageW - marginX - 200, y, { align: 'right' });
    doc.text(rp(it.priceInIdr + it.jastipFee), pageW - marginX - 110, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(rp(itemSubtotal(it)), pageW - marginX, y, { align: 'right' });
    y += meta ? 28 : 20;
  });

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, y, pageW - marginX, y);
  y += 22;

  // totals
  const totalRow = (label: string, value: string, color: [number, number, number], bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...gray);
    doc.text(label, pageW - marginX - 160, y, { align: 'left' });
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageW - marginX, y, { align: 'right' });
    y += 18;
  };
  totalRow('Subtotal Barang', rp(o.totalAmount - (o.shipCost || 0)), [15, 23, 42]);
  if (o.shipCost) totalRow('Ongkir', rp(o.shipCost), [15, 23, 42]);
  totalRow('Total Order', rp(o.totalAmount), [15, 23, 42], true);
  totalRow('Sudah Dibayar', rp(o.paidAmount), [22, 163, 74]);
  totalRow('Sisa Pelunasan', rp(o.remainingAmount), [217, 119, 6]);

  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX, y, pageW - marginX * 2, 56, 6, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Pembayaran: ${bankInfo}`, marginX + 12, y + 20);
  doc.text('Order yang sudah dibelikan tidak bisa dibatalkan.', marginX + 12, y + 34);
  doc.text('Pelunasan wajib sebelum barang dikirim.', marginX + 12, y + 46);

  doc.save(`${o.invoiceNo}-${o.customerName.replace(/\s+/g, '_')}.pdf`);
}

export async function exportReportExcel(orders: Order[]) {
  const XLSX = await import('xlsx');
  const rows = orders.map(o => ({
    'Invoice': o.invoiceNo,
    'Customer': o.customerName,
    'Batch': o.batchName,
    'Tanggal': o.orderDate,
    'Modal Barang': o.totalProduct,
    'Fee Jastip': o.totalFee,
    'Ongkir': o.totalLocal + o.totalIntl,
    'Total Order': o.totalAmount,
    'Sudah Dibayar': o.paidAmount,
    'Sisa': o.remainingAmount,
    'Estimasi Profit': o.totalFee,
    'Status Bayar': o.paymentStatus,
    'Status Order': o.orderStatus,
  }));

  // summary row
  const sum = (k: keyof typeof rows[0]) => orders.reduce((s, o) => {
    const map: Record<string, number> = {
      'Modal Barang': o.totalProduct, 'Fee Jastip': o.totalFee, 'Ongkir': o.totalLocal + o.totalIntl,
      'Total Order': o.totalAmount, 'Sudah Dibayar': o.paidAmount, 'Sisa': o.remainingAmount, 'Estimasi Profit': o.totalFee,
    };
    return s + (map[k as string] || 0);
  }, 0);
  rows.push({
    'Invoice': 'TOTAL', 'Customer': '', 'Batch': '', 'Tanggal': '',
    'Modal Barang': sum('Modal Barang'), 'Fee Jastip': sum('Fee Jastip'), 'Ongkir': sum('Ongkir'),
    'Total Order': sum('Total Order'), 'Sudah Dibayar': sum('Sudah Dibayar'), 'Sisa': sum('Sisa'),
    'Estimasi Profit': sum('Estimasi Profit'), 'Status Bayar': '', 'Status Order': '',
  } as typeof rows[0]);

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Jastip');
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Laporan-Jastip-${today}.xlsx`);
}
