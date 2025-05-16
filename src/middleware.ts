// middleware.ts 수정
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

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
  PROTECTED_ROUTES: ['/mypage', '/board'],
  PUBLIC_ROUTES: ['/auth/login', '/auth/signup', '/'],
};

// 타입 정의
interface BoardAccessResponse {
  hasAccess: boolean;
  message?: string;
}

// 인증 검증 헬퍼 함수
async function validateAuth(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...CONSTANTS.COOKIE_OPTIONS,
            ...options,
          };
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...CONSTANTS.COOKIE_OPTIONS,
            ...options,
          };
          request.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

// 게시판 접근 권한 검증
async function validateBoardAccess(
  user: any,
  boardSlug: string,
  supabase: any
): Promise<BoardAccessResponse> {
  if (!user) {
    return {
      hasAccess: false,
      message: '학교게시판을 사용하시려면 로그인과 학교인증이 필요합니다.',
    };
  }

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', boardSlug)
    .single();

  if (!category) {
    return { hasAccess: false, message: 'Category not found' };
  }

  if (category.parent_id === 2) {
    const { data: verifications } = await supabase
      .from('school_verifications')
      .select('school_id, status')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .not('verified_at', 'is', null);

    if (!verifications?.length) {
      return { hasAccess: false, message: '학교 인증이 필요합니다.' };
    }

    if (verifications[0].school_id !== category.id) {
      return { hasAccess: false, message: '다른 학교 게시판입니다.' };
    }
  }

  return { hasAccess: true };
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // 세션 새로고침
  await supabase.auth.getSession()
  
  // x-pathname 헤더 설정
  res.headers.set('x-pathname', req.nextUrl.pathname)
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
