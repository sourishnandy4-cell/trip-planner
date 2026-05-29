import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://rggsvpjiwhdicgaukcaa.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ3N2cGppd2hkaWNnYXVrY2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTgwMjksImV4cCI6MjA5NTM5NDAyOX0.2eQxJpPxgd255NsqHhxyF3sWjm40Xe7YFWqCrdI8hS0';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || DEFAULT_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && url.includes('supabase.co');
  } catch {
    return false;
  }
};

// Static mock mode is permanently disabled to always connect to live cloud
const staticMockMode = false;

// Runtime connectivity fallback is disabled to force live connection
export const setRuntimeMockMode = () => {
  try { sessionStorage.removeItem('wandr_supabase_offline'); } catch {}
};

export const isMockMode = () => false;

if (staticMockMode) {
  console.info('[Wandr] No Supabase config — running in offline mock mode.');
} else {
  console.info('[Wandr] Supabase client initialised →', SUPABASE_URL);
}

export const supabase = !staticMockMode
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// USE_MOCK_MODE kept for authService.js backward-compat (it checks at import time)
export const USE_MOCK_MODE = staticMockMode;
