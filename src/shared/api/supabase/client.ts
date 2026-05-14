'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | null = null;

const URL_FALLBACK = 'https://placeholder.supabase.co';
const KEY_FALLBACK = 'placeholder-anon-key';

export function createClient() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || URL_FALLBACK;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || KEY_FALLBACK;
  _client = createBrowserClient(url, key);
  return _client;
}
