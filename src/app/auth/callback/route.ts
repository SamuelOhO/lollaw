import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
      // const cookieStore = await cookies()
      
      // 쿠키 스토어를 직접 처리
      const supabase = createRouteHandlerClient({ 
        // cookies: () => ({
        //   get(name: string) {
        //     return cookieStore.get(name)
        //   },
        //   set(name: string, value: string, options: any) {
        //     try {
        //       cookieStore.set(name, value, options)
        //     } catch (error) {
        //       console.error('쿠키 설정 에러:', error)
        //     }
        //   },
        //   remove(name: string, options: any) {
        //     try {
        //       cookieStore.set(name, '', { ...options, maxAge: 0 })
        //     } catch (error) {
        //       console.error('쿠키 삭제 에러:', error)
        //     }
        //   }
        // })
        cookies
      })

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('세션 교환 에러:', error)
      } catch (error) {
        console.error('세션 교환 중 에러:', error)
      }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
  } catch (error) {
    console.error('콜백 처리 에러:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=unknown_error`)
  }
}