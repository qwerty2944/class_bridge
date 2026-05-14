import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const URL_FALLBACK = 'https://placeholder.supabase.co';
const KEY_FALLBACK = 'placeholder-anon-key';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || URL_FALLBACK;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || KEY_FALLBACK;
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // RSC 환경 — middleware가 갱신
        }
      },
    },
  });
}
