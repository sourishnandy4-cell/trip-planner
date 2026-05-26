import { createClient } from '@supabase/supabase-js';

// In production (GitHub Pages) these are injected by the GitHub Actions workflow
// via repository secrets: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// For local dev, copy .env.example → .env and fill in your project values.
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && url.includes('supabase.co');
  } catch {
    return false;
  }
};

// Falls back to high-fidelity localStorage mock mode when no real project is configured.
export const isMockMode =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !isValidUrl(SUPABASE_URL) ||
  SUPABASE_URL === 'your_supabase_url_here' ||
  SUPABASE_ANON_KEY === 'your_supabase_anon_key_here' ||
  SUPABASE_ANON_KEY.length < 100; // Valid JWT tokens are longer

if (isMockMode) {
  console.info('[Wandr] No Supabase config detected — running in offline mock mode.');
  console.info('[Wandr] URL present:', !!SUPABASE_URL, 'Key present:', !!SUPABASE_ANON_KEY);
} else {
  console.info('[Wandr] Supabase client initialised.');
  console.info('[Wandr] Connected to:', SUPABASE_URL);
}

export const supabase = !isMockMode
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const USE_MOCK_MODE = isMockMode;
