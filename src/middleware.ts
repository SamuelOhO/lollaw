// middleware.ts 수정
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@/utils/supabase/server';

// 환경 변수 검증 스키마
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_DOMAIN: z.string().optional(),
});

// 상수 정의
const CONSTANTS = {
  COOKIE_OPTIONS: {
    path: '/',
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7일
  },
  PROTECTED_ROUTES: ['/mypage'],
  PUBLIC_ROUTES: ['/auth/login', '/auth/signup', '/'],
};

// 타입 정의
interface BoardAccessResponse {
  hasAccess: boolean;
  message?: string;
}

// 비로그인 허용 카테고리 slug 리스트 (DB와 동기화 필요)
const PUBLIC_CATEGORY_SLUGS = [
  'free', 'free-student', 'leet', 'law-success', 'anything'
];

const PROTECTED_PATHS = ['/mypage', '/write'];
const LOGIN_PATH = '/auth/login';

function isProtectedPath(pathname: string) {
  if (pathname === '/board' || pathname === '/board/') return false;
  if (pathname.startsWith('/board/')) {
    const parts = pathname.split('/');
    const categorySlug = parts[2];
    if (!categorySlug) return false;
    // slug가 DB에 없는 경우(잘못된 접근)는 보호 경로로 간주하지 않고, 페이지에서 404 처리
    if (![
      'free', 'schools', 'free-student', 'leet', 'yonsei', 'konkuk', 'law-success', 'anything'
    ].includes(categorySlug)) return false;
    return !PUBLIC_CATEGORY_SLUGS.includes(categorySlug);
  }
  return CONSTANTS.PROTECTED_ROUTES.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const isLoggedIn = cookieNames.some((name) => name.startsWith('sb-'));
  const isLoginPage = pathname.startsWith(LOGIN_PATH);

  // 비로그인 사용자가 보호 경로 접근 시
  if (!isLoggedIn && isProtectedPath(pathname) && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
  // 로그인 사용자가 로그인 페이지 접근 시
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
