import { createClient } from '@supabase/supabase-js';

type BasicRequest = {
  headers: Record<string, string | string[] | undefined>;
};

export async function getRequestUser(req: BasicRequest): Promise<{ id: string; email?: string } | null> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
