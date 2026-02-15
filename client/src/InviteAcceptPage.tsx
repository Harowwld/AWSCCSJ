import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

type Phase = 'checking' | 'signed_out' | 'signed_in_pending' | 'signed_in_admin';

export default function InviteAcceptPage() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setError('Supabase is not configured.');
      setPhase('signed_out');
      return;
    }

    client.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message);

      const accessToken = data.session?.access_token ?? null;

      const { data: userRes, error: userError } = await client.auth.getUser();
      if (userError) setError(userError.message);

      const user = userRes.user;
      if (!user) {
        setPhase('signed_out');
        return;
      }

      setEmail(user.email ?? null);

      if (accessToken) {
        try {
          const redeemRes = await fetch('/api/redeem-admin-invite', {
            method: 'POST',
            headers: { authorization: `Bearer ${accessToken}` },
          });
          if (!redeemRes.ok) {
            const j = await redeemRes.json().catch(() => null);
            if (j?.error) setError(j.error);
          }
        } catch (e: any) {
          setError(e?.message ?? 'Redeem failed');
        }
      }

      const { data: adminRow, error: adminError } = await client
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError) {
        setError(adminError.message);
        setPhase('signed_in_pending');
        return;
      }

      setPhase(adminRow ? 'signed_in_admin' : 'signed_in_pending');
    });
  }, []);

  const content = useMemo(() => {
    if (phase === 'checking') {
      return { title: 'Checking invitation…', body: 'Please wait.' };
    }

    if (phase === 'signed_out') {
      return { title: 'Invitation link opened', body: 'Please sign in to complete setup.' };
    }

    if (phase === 'signed_in_admin') {
      return { title: 'Admin access activated', body: 'You can now open the admin dashboard.' };
    }

    return { title: 'Invite accepted', body: 'Your account is signed in. Admin access will be activated shortly.' };
  }, [phase]);

  return (
    <div className="min-h-screen bg-glow-animated px-4 py-16">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="card p-6 space-y-3">
          <h1 className="text-2xl font-bold text-white">{content.title}</h1>
          <p className="text-slate-300">{content.body}</p>
          {email && <p className="text-sm text-slate-400">Signed in as {email}</p>}
          {error && <div className="mt-2 text-sm text-red-200">{error}</div>}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl font-semibold border bg-orange-500/15 text-orange-100 border-orange-400/30 hover:bg-orange-500/20"
            >
              Go to Admin
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl font-semibold border bg-white/5 text-slate-100 border-white/10 hover:bg-white/10"
            >
              Back to site
            </Link>
          </div>

          {phase === 'signed_out' && (
            <p className="text-xs text-slate-400">
              If you already set a password via the email link, sign in on the admin page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
