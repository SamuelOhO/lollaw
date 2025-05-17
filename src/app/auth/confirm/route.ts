import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const origin = requestUrl.origin;

  // 이메일 확인이 아닌 경우 무시
  if (type !== 'email' || !token_hash) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_link', origin));
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value,
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
            });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({
              name,
              ...options,
              path: '/',
            });
          },
        },
      }
    );

    // 이메일 확인 처리
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email',
    });

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=verification_failed', origin));
    }

    // 세션 확인
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login?message=verification_success', origin));
    }

    // 인증 성공 후 홈페이지로 리다이렉션
    return NextResponse.redirect(new URL('/?message=verification_success', origin));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', origin));
  }
}
