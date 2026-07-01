import sharp from 'sharp';
import path from 'path';

const DIR = path.resolve('public/screenshots');

const crops = {
  'dashboard': 500,
  'create-order': 900,
  'orders': 560,
  'order-detail-produk': 500,
  'order-invoice': 900,
  'order-link': 560,
  'customers': 460,
  'reports': 780,
  'fees': 760,
  'payments': 610,
};

(async () => {
  for (const [name, height] of Object.entries(crops)) {
    const file = path.join(DIR, `${name}.png`);
    await sharp(file).extract({ left: 0, top: 0, width: 1032, height }).toFile(path.join(DIR, `${name}-crop.png`));
    console.log('cropped:', name, height);
  }
})();
