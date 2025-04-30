// // middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // auth 관련 경로는 처리하지 않음
    if (req.nextUrl.pathname.startsWith('auth' ) || req.nextUrl.pathname.startsWith('api/auth')) {
      return res
    }

    // 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트
    if (req.nextUrl.pathname === 'auth/login' && session) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('미들웨어 에러:', error)
    return res
  }
}

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
// }

export const config = {
    matcher: [
    '/community/:path*',
    '/board/:path*',
    '/auth/login',
    '/api/auth/callback/:path*'
    ]
}