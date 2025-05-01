import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', origin))
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
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
            })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({
              name,
              ...options,
              path: '/',
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', origin))
    }

    // 세션이 제대로 설정되었는지 확인
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('Session not established after code exchange')
      return NextResponse.redirect(new URL('/auth/login?error=session_failed', origin))
    }

    // 로그인 성공 후 원래 가려던 페이지로 리디렉션
    const intendedPath = cookieStore.get('intended_path')?.value
    const redirectTo = intendedPath || '/'
    
    // intended_path 쿠키 삭제
    if (intendedPath) {
      cookieStore.delete('intended_path')
    }

    // 리다이렉트
    return NextResponse.redirect(new URL(redirectTo, origin))

  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', origin))
  }
} 