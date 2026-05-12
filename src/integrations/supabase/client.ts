import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

/**
 * Creates the Supabase client.
 *
 * Why lazy initialization with a fallback:
 * During local development without Supabase credentials, the app should
 * still render the UI. The client is created with empty strings, and
 * any actual DB operations will fail gracefully at the service layer.
 */
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const url = env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = env.SUPABASE_ANON_KEY || 'placeholder-key';
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}


