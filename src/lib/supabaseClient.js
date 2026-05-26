import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tmggnwyaspwlbhfjhwnx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZ2dud3lhc3B3bGJoZmpod254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI2ODgsImV4cCI6MjA5NTI5ODY4OH0.q1rEu1HM5C8UWAdHhh8dY1LGI_n-9-B-v_kzZBQeCfs';

// Detect if we should use fallback mock mode
export const isMockMode = 
  !SUPABASE_URL || 
  !SUPABASE_ANON_KEY || 
  SUPABASE_URL === 'your_supabase_url_here' || 
  SUPABASE_ANON_KEY === 'your_supabase_anon_key_here';

if (isMockMode) {
  console.warn('[Supabase] Environment variables missing or placeholder. Running in high-fidelity mock mode.');
} else {
  console.log('[Supabase] Initializing real client with configured environment variables.');
}

export const supabase = !isMockMode 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;
