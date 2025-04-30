import { createServerSupabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/'

    if (code) {
      const supabase = await createServerSupabase()

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
        console.error('세션 교환 에러:', error)
      } catch (error) {
        console.error('세션 교환 중 에러:', error)
      }
    }

    return NextResponse.redirect(new URL('/auth/login?error=callback_error', requestUrl.origin))
  } catch (error) {
    console.error('콜백 처리 에러:', error)
    return NextResponse.redirect(new URL('/auth/login?error=unknown_error', requestUrl.origin))
  }
}