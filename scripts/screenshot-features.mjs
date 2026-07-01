import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:3000/app';

async function shot(page, name) {
  await page.waitForTimeout(400);
  const el = await page.$('main');
  if (el) {
    await el.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  } else {
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  }
  console.log('saved:', name);
}

async function clickByText(page, text, tag = 'a, button') {
  const clicked = await page.evaluate(({ text, tag }) => {
    const els = [...document.querySelectorAll(tag)];
    const el = els.find(e => e.textContent.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(text.toLowerCase()));
    if (el) { el.click(); return true; }
    return false;
  }, { text, tag });
  await page.waitForTimeout(500);
  return clicked;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'demo@jastipos.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(800);

  // 1. Dashboard
  await shot(page, 'dashboard');

  // 2. Buat Order — chat AI parse (isi textarea agar terlihat)
  await clickByText(page, 'Buat Order');
  await page.waitForTimeout(400);
  await shot(page, 'create-order');

  // 3. Orders list
  await clickByText(page, 'Order', 'a');
  await page.waitForTimeout(400);
  await shot(page, 'orders');

  // 4. Order detail -> Produk tab (klik baris order pertama di tabel)
  const openedDetail = await page.evaluate(() => {
    const row = document.querySelector('tbody tr');
    if (row) { row.click(); return true; }
    return false;
  });
  console.log('opened detail:', openedDetail);
  await page.waitForTimeout(500);
  await shot(page, 'order-detail-produk');

  // 5. Invoice tab
  await clickByText(page, 'Invoice', 'button, a, div');
  await page.waitForTimeout(500);
  await shot(page, 'order-invoice');

  // 6. Customer Link tab
  await clickByText(page, 'Customer Link', 'button, a, div');
  await page.waitForTimeout(500);
  await shot(page, 'order-link');

  // 7. Customers
  await clickByText(page, 'Customer', 'a');
  await page.waitForTimeout(400);
  await shot(page, 'customers');

  // 8. Reports
  await clickByText(page, 'Laporan', 'a');
  await page.waitForTimeout(400);
  await shot(page, 'reports');

  // 9. Fees
  await clickByText(page, 'Setting Fee', 'a');
  await page.waitForTimeout(400);
  await shot(page, 'fees');

  // 10. Payments
  await clickByText(page, 'Pembayaran', 'a');
  await page.waitForTimeout(400);
  await shot(page, 'payments');

  await browser.close();
  console.log('DONE');
})();
