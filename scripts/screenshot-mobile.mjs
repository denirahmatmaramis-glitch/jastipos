import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/screenshots/mobile');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'http://localhost:3000/app';

async function shot(page, name) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'demo@jastipos.com');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(800);

  // 1. Dashboard (mobile redesign)
  await shot(page, 'dashboard');

  // 2. Buat Order — buka via bottom nav "Buat"
  await clickByText(page, 'Buat', 'button');
  await page.waitForTimeout(400);
  await shot(page, 'create-order');

  // 3. Orders list — buka via bottom nav "Order"
  await clickByText(page, 'Order', 'button');
  await page.waitForTimeout(400);
  await shot(page, 'orders');

  // 4. Order detail -> klik card order pertama (skip tombol header "+ Buat Order")
  const opened = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('main [class*="cursor-pointer"]')];
    const card = candidates.find(el => !el.textContent.includes('Buat Order') && !el.matches('button'));
    if (card) { card.click(); return true; }
    return false;
  });
  console.log('opened detail:', opened);
  await page.waitForTimeout(500);

  // 5. Invoice tab
  await clickByText(page, 'Invoice', 'button, a, div');
  await page.waitForTimeout(500);
  await shot(page, 'order-invoice');

  // 6. Customer Link tab
  await clickByText(page, 'Customer Link', 'button, a, div');
  await page.waitForTimeout(500);
  await shot(page, 'order-link');

  // 7. Buka Preview (in-app track view -> customer-facing UI)
  const openedPreview = await clickByText(page, 'Buka Preview', 'button');
  console.log('opened preview:', openedPreview);
  await page.waitForTimeout(600);
  // Sembunyikan tombol "Kembali ke admin" secara visual (tetap bisa diklik via JS) — customer asli tidak melihat ini
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Kembali ke admin'));
    if (btn) btn.style.opacity = '0';
  });
  await shot(page, 'track-preview');

  // Kembali ke app via tombol in-app (SPA tanpa URL routing — browser back tidak berlaku)
  const wentBack = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Kembali ke admin'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('went back:', wentBack);
  await page.waitForTimeout(500);

  async function openMore(label) {
    await clickByText(page, 'Lainnya', 'button');
    await page.waitForTimeout(400);
    // Scope ke panel bottom-sheet ("Lainnya") saja — hindari salah klik tab/tombol
    // lain yang textContent-nya juga startsWith label ini (mis. "Customer Link").
    const clicked = await page.evaluate((label) => {
      const panel = document.querySelector('.animate-slideup');
      if (!panel) return false;
      const btn = [...panel.querySelectorAll('button')].find(b => b.textContent.replace(/\s+/g, ' ').trim() === label);
      if (btn) { btn.click(); return true; }
      return false;
    }, label);
    console.log('openMore', label, clicked);
    await page.waitForTimeout(500);
  }

  // 8. Customers
  await openMore('Customer');
  await shot(page, 'customers');

  // 9. Reports
  await openMore('Laporan');
  await shot(page, 'reports');

  // 10. Fees
  await openMore('Setting Fee');
  await shot(page, 'fees');

  await browser.close();
  console.log('DONE');
})();
