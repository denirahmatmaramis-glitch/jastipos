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
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
      createdAt: p.created_at,
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
    await admin.from('profiles').update({ plan: 'pro', upgrade_status: 'active' }).eq('id', userId);
    return Response.json({ ok: true, message: 'User diaktifkan ke Pro' });
  }

  if (action === 'deactivate') {
    await admin.from('profiles').update({ plan: 'free', upgrade_status: 'none' }).eq('id', userId);
    return Response.json({ ok: true, message: 'User dikembalikan ke Free' });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
