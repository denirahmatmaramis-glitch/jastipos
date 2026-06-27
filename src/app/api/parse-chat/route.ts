// AI endpoint: reads a customer's WhatsApp chat and extracts structured jastip order data.
// Uses Google Gemini (free tier) so it costs nothing to start. Runs server-side so the
// API key is never exposed to the browser.

export const runtime = 'nodejs';

// Model gratis dari Gemini free tier. Bisa diganti lewat env GEMINI_MODEL.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Skema output (format Gemini — tipe huruf besar).
const responseSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Nama customer' },
    phone: { type: 'STRING', description: 'Nomor WhatsApp/HP customer apa adanya' },
    address: { type: 'STRING', description: 'Kota atau alamat customer' },
    instagram: { type: 'STRING', description: 'Username Instagram (dengan @), kosong jika tidak ada' },
    custNotes: { type: 'STRING', description: 'Catatan tambahan dari customer' },
    items: {
      type: 'ARRAY',
      description: 'Daftar produk yang ingin dipesan',
      items: {
        type: 'OBJECT',
        properties: {
          productName: { type: 'STRING', description: 'Nama produk' },
          brandStore: { type: 'STRING', description: 'Brand atau toko, kosong jika tidak disebut' },
          color: { type: 'STRING', description: 'Warna, kosong jika tidak ada' },
          size: { type: 'STRING', description: 'Ukuran/size, kosong jika tidak ada' },
          qty: { type: 'INTEGER', description: 'Jumlah, default 1' },
          priceInIdr: { type: 'INTEGER', description: 'Harga satuan dalam Rupiah sebagai angka bulat. "499.000"/"499rb"/"499k" => 499000. 0 jika tidak disebut' },
        },
        required: ['productName', 'brandStore', 'color', 'size', 'qty', 'priceInIdr'],
        propertyOrdering: ['productName', 'brandStore', 'color', 'size', 'qty', 'priceInIdr'],
      },
    },
  },
  required: ['name', 'phone', 'address', 'instagram', 'custNotes', 'items'],
  propertyOrdering: ['name', 'phone', 'address', 'instagram', 'custNotes', 'items'],
};

const SYSTEM_PROMPT = `Kamu adalah asisten untuk admin jastip (titip beli) di Indonesia. Tugasmu membaca chat WhatsApp dari customer dan mengekstrak data order menjadi JSON terstruktur.

Aturan:
- Harga: ubah format Indonesia menjadi angka bulat Rupiah. "499.000", "499rb", "499k", "Rp499.000" semuanya = 499000. Titik adalah pemisah ribuan, bukan desimal.
- Nomor HP: ambil apa adanya dari chat (jangan diubah formatnya).
- qty default 1 jika tidak disebut.
- Hanya masukkan produk yang benar-benar ingin dipesan customer. Abaikan basa-basi.
- Jika sebuah field tidak ada di chat, isi dengan string kosong "" (atau 0 untuk harga).
- Jangan mengarang data yang tidak ada di chat.`;

export async function POST(request: Request) {
  let chatText = '';
  try {
    const body = await request.json();
    chatText = (body?.chatText || '').toString().trim();
  } catch {
    return Response.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  if (!chatText) {
    return Response.json({ error: 'Chat customer kosong.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY belum diatur di server. Tambahkan di file .env.local lalu restart.' },
      { status: 503 }
    );
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: `Berikut chat customer:\n\n${chatText}` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0,
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      const msg = result?.error?.message || `Gemini error (${res.status})`;
      return Response.json({ error: msg }, { status: 502 });
    }

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const reason = result?.candidates?.[0]?.finishReason;
      return Response.json(
        { error: reason ? `AI tidak mengembalikan hasil (${reason}).` : 'AI tidak mengembalikan hasil.' },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);
    return Response.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memproses chat.';
    return Response.json({ error: message }, { status: 500 });
  }
}
