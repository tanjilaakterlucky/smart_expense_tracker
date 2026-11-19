import { createClient } from '@supabase/supabase-js';

// Safe retrieval of Supabase credentials from Env or LocalStorage
export function getSupabaseCredentials() {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('finora_sb_url') || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('finora_sb_anon_key') || '' : '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('finora_sb_url', url.trim());
    localStorage.setItem('finora_sb_anon_key', anonKey.trim());
  }
}

const creds = getSupabaseCredentials();

export const supabase = creds.isConfigured
  ? createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
