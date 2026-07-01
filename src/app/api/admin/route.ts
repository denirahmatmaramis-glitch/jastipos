import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

async function verifyAdmin(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const userClient = createClient(supabaseUrl, anonKey);
  const { data: { user } } = await userClient.auth.getUser(token);
  if (!user || user.email !== SUPER_ADMIN_EMAIL) return null;
  return user.id;
}

export async function GET(request: Request) {
  const adminId = await verifyAdmin(request);
  if (!adminId) return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const admin = getAdminClient();
  if (!admin) return Response.json({ error: 'Service key not configured' }, { status: 503 });

  const { data: profiles } = await admin.from('profiles').select('*').order('created_at', { ascending: false });

  const users = [];
  for (const p of (profiles || [])) {
    const { count: orderCount } = await admin.from('orders').select('*', { count: 'exact', head: true }).eq('owner_id', p.id);
    const { count: customerCount } = await admin.from('customers').select('*', { count: 'exact', head: true }).eq('owner_id', p.id);
    users.push({
      id: p.id,
      email: p.email,
      storeName: p.store_name,
      plan: p.plan,
      upgradeStatus: p.upgrade_status,
      upgradeSenderName: p.upgrade_sender_name || '',
      upgradeAmount: p.upgrade_amount || 0,
      upgradeCode: p.upgrade_code || '',
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
      createdAt: p.created_at,
      proStartDate: p.pro_start_date || null,
      proEndDate: p.pro_end_date || null,
    });
  }

  return Response.json({ users });
}

export async function POST(request: Request) {
  const adminId = await verifyAdmin(request);
  if (!adminId) return Response.json({ error: 'Unauthorized' }, { status: 403 });

  const admin = getAdminClient();
  if (!admin) return Response.json({ error: 'Service key not configured' }, { status: 503 });

  const body = await request.json();
  const { action, userId } = body;

  if (action === 'activate') {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);
    await admin.from('profiles').update({
      plan: 'pro',
      upgrade_status: 'active',
      pro_start_date: now.toISOString(),
      pro_end_date: endDate.toISOString(),
    }).eq('id', userId);
    return Response.json({ ok: true, message: 'User diaktifkan ke Pro (30 hari)' });
  }

  if (action === 'deactivate') {
    await admin.from('profiles').update({
      plan: 'free',
      upgrade_status: 'none',
      pro_start_date: null,
      pro_end_date: null,
    }).eq('id', userId);
    return Response.json({ ok: true, message: 'User dikembalikan ke Free' });
  }

  if (action === 'delete') {
    // Hapus dari auth (cascade ke profiles via FK)
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    // Hapus manual dari profiles jika tidak ada ON DELETE CASCADE
    await admin.from('profiles').delete().eq('id', userId);
    return Response.json({ ok: true, message: 'User berhasil dihapus' });
  }

  if (action === 'impersonate') {
    const { email } = body;
    if (!email) return Response.json({ error: 'Email diperlukan' }, { status: 400 });

    // Tentukan origin produksi supaya magic link tidak balik ke localhost.
    const origin =
      (typeof body.origin === 'string' && body.origin) ||
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      '';
    const redirectTo = origin ? `${origin.replace(/\/$/, '')}/app` : undefined;

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error || !data?.properties?.action_link) {
      return Response.json({ error: error?.message || 'Gagal membuat link' }, { status: 500 });
    }
    return Response.json({ ok: true, link: data.properties.action_link });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
