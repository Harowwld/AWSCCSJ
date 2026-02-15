import { createClient } from '@supabase/supabase-js';

type BasicRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type BasicResponse = {
  status: (code: number) => BasicResponse;
  json: (payload: any) => void;
};

async function getRequestUser(req: BasicRequest): Promise<{ id: string; email?: string } | null> {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const rawHeader = req.headers.authorization;
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (!authHeader?.toLowerCase().startsWith('bearer ')) return null;
  const token = authHeader.slice('bearer '.length);

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? undefined };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Missing env SUPABASE_URL');
  if (!key) throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY');

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function handler(req: BasicRequest, res: BasicResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const user = await getRequestUser(req);
    if (!user || !user.email) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const email = user.email.trim().toLowerCase();
    const admin = getSupabaseAdmin();

    const { data: pending, error: pendingError } = await admin
      .from('pending_admin_invites')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (pendingError) {
      res.status(500).json({ error: pendingError.message });
      return;
    }

    if (!pending) {
      res.status(200).json({ ok: true, activated: false });
      return;
    }

    const { error: insertError } = await admin.from('admins').upsert({ user_id: user.id }, { onConflict: 'user_id' });
    if (insertError) {
      res.status(500).json({ error: insertError.message });
      return;
    }

    const { error: deleteError } = await admin.from('pending_admin_invites').delete().eq('email', email);
    if (deleteError) {
      res.status(500).json({ error: deleteError.message });
      return;
    }

    res.status(200).json({ ok: true, activated: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}
