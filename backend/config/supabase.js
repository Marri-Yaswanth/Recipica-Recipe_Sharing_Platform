import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const provider = (process.env.DB_PROVIDER || '').trim().toLowerCase();

export const isSupabaseEnabled =
  (process.env.USE_SUPABASE || '').trim().toLowerCase() === 'true' ||
  provider === 'supabase';

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseServiceRoleKey);

export const supabase = hasSupabaseCredentials
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export function assertSupabaseReady() {
  if (!isSupabaseEnabled) {
    throw new Error('Supabase is not enabled. Set USE_SUPABASE=true or DB_PROVIDER=supabase.');
  }

  if (!supabase) {
    throw new Error('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return supabase;
}
