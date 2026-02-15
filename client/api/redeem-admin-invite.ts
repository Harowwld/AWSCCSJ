import { getRequestUser } from './_auth.js';
import { getSupabaseAdmin } from './_supabaseAdmin.js';

type BasicRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type BasicResponse = {
  status: (code: number) => BasicResponse;
  json: (payload: any) => void;
};

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
