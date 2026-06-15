import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Supabase browser client. Uses the anon key, which is safe to ship: every table
 * is guarded by RLS (see supabase/migrations/0002_rls.sql). Service-role and AI
 * keys must NEVER reach the browser — they live in the backend proxy only.
 *
 * The client is created lazily so the app still builds/runs without Supabase env
 * (the mock store remains the default until the real repository is wired).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
    );
  }
  if (!client) {
    client = createClient<Database>(url as string, anonKey as string);
  }
  return client;
}
