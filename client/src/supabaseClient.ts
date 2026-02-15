import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any)?.env as any;
const globalEnv = (globalThis as any)?.env as any;
const supabaseUrl = metaEnv?.VITE_SUPABASE_URL ?? globalEnv?.VITE_SUPABASE_URL ?? (process as any)?.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = metaEnv?.VITE_SUPABASE_ANON_KEY ?? globalEnv?.VITE_SUPABASE_ANON_KEY ?? (process as any)?.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are missing. Using mock data only.');
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
