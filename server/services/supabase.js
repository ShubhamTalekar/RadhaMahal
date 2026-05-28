/**
 * server/services/supabase.js
 *
 * Shared Supabase client for the backend (service-role key).
 * The service-role key bypasses Row-Level Security — NEVER expose it to the browser.
 *
 * Required env vars (add to .env.local):
 *   SUPABASE_URL            — your project URL (https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — secret service-role key from Project Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// env is already loaded by config/env.js before this module is imported.
// We read directly from process.env so we don't double-load dotenv here.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.warn('[Supabase] ⚠️  SUPABASE_URL is not set. Add it to .env.local.');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[Supabase] ⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to VITE_SUPABASE_ANON_KEY. RLS-protected actions may fail.');
}

/**
 * Supabase client — falls back to anon key if service-role is missing.
 * Import this singleton everywhere; do NOT create multiple clients.
 */
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey, {
          auth: {
              persistSession: false,   // server process has no browser session
              autoRefreshToken: false,
          },
      })
    : null;

if (supabase) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('[Supabase] ✅ Client initialised (service-role).');
    } else {
        console.log('[Supabase] ⚠️ Client initialised (anon key fallback).');
    }
}
