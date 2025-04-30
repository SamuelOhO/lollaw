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
    
    // URL에서 학교 슬러그 추출
  const pathname = req.nextUrl.pathname
  const boardMatch = pathname.match(/^\/board\/([^\/]+)/)
  
  if (boardMatch) {
    const schoolSlug = boardMatch[1]

    if (!session) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // 사용자의 학교 인증 정보 확인
    const { data: verification, error } = await supabase
    .from('school_verifications')
    .select(`
      *,
      school:school_id (
        slug
      )
    `)
    .eq('user_id', session.user.id)
    .eq('status', 'verified')
    .single()

    if (error || !verification || verification.school.slug !== schoolSlug) {
      // 인증되지 않은 학교의 게시판 접근 시도
      return NextResponse.redirect(new URL(`/unauthorized/${schoolSlug}`, req.url))
    }
  }

    // auth 관련 경로는 처리하지 않음
    if (req.nextUrl.pathname.startsWith('auth') || req.nextUrl.pathname.startsWith('api/auth')) {
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