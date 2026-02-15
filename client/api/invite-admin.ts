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

const REDIRECT_TO = 'https://awsccsj.vercel.app/invite/accept';

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
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const targetEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!targetEmail || !targetEmail.includes('@')) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }

    const admin = getSupabaseAdmin();

    const { data: isAdminRow, error: isAdminError } = await admin
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (isAdminError) {
      res.status(500).json({ error: isAdminError.message });
      return;
    }

    if (!isAdminRow) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(targetEmail, {
      redirectTo: REDIRECT_TO,
    });

    if (inviteError) {
      res.status(500).json({ error: inviteError.message });
      return;
    }

    const { error: pendingError } = await admin.from('pending_admin_invites').upsert(
      { email: targetEmail },
      { onConflict: 'email' }
    );

    if (pendingError) {
      res.status(500).json({ error: pendingError.message });
      return;
    }

    res.status(200).json({ ok: true, invitedEmail: targetEmail, invitedUserId: inviteData?.user?.id ?? null });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Server error' });
  }
}
