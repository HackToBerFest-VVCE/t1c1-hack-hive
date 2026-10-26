import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Safe client helpers with fallback to local storage for offline hackathon testing
export async function getSession() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }
  const local = localStorage.getItem('labsense_local_session');
  return local ? JSON.parse(local) : null;
}

export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    return await supabase.auth.signOut();
  }
  localStorage.removeItem('labsense_local_session');
  return { error: null };
}
