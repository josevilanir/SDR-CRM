import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file.');
}

// Always generate a fresh tabId on every page load — never read from sessionStorage.
// This ensures a duplicated tab immediately gets a different BroadcastChannel name
// so logout/login events in one tab never bleed into another.
const tabId = Math.random().toString(36).slice(2, 10);
const CHANNEL_KEY = `sb-auth-${tabId}`;

// The session itself is stored under a fixed key so it survives page refreshes
// (sessionStorage persists across F5 within the same tab).
const SESSION_KEY = 'sdr-crm-auth-session';

// Custom storage adapter: the Supabase auth library reads/writes using CHANNEL_KEY
// (which is unique per load), but we redirect those reads/writes to SESSION_KEY
// (fixed). All other keys (PKCE verifiers, etc.) pass through unchanged.
const tabStorage = {
  getItem: (key: string) =>
    sessionStorage.getItem(key === CHANNEL_KEY ? SESSION_KEY : key),
  setItem: (key: string, value: string) =>
    sessionStorage.setItem(key === CHANNEL_KEY ? SESSION_KEY : key, value),
  removeItem: (key: string) =>
    sessionStorage.removeItem(key === CHANNEL_KEY ? SESSION_KEY : key),
};

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: tabStorage,
    storageKey: CHANNEL_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
