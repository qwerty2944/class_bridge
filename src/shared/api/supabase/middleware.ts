import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const URL_FALLBACK = 'https://placeholder.supabase.co';
const KEY_FALLBACK = 'placeholder-anon-key';
const PUBLIC_PATHS = ['/login', '/signup', '/auth/callback', '/'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || URL_FALLBACK;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || KEY_FALLBACK;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (!user && !isPublic) {
      const target = request.nextUrl.clone();
      target.pathname = '/login';
      target.searchParams.set('next', pathname);
      return NextResponse.redirect(target);
    }

    if (user && (pathname === '/login' || pathname === '/signup')) {
      const target = request.nextUrl.clone();
      target.pathname = '/dashboard';
      return NextResponse.redirect(target);
    }
  } catch {
    // env 미설정 등으로 supabase 호출 실패 시 — 그냥 통과
  }

  return response;
}
