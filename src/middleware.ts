// middleware.ts
import { createServerSupabase } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = await createServerSupabase()

  try {
    const pathname = req.nextUrl.pathname
     
    // 게시판 접근 체크
    const boardMatch = pathname.match(/^\/board\/([^\/]+)/)
    if (boardMatch) {
      const boardSlug = boardMatch[1]

      // 카테고리 정보 조회
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', boardSlug)
        .single()

      if (categoryError || !category) {
        return NextResponse.redirect(new URL('/404', req.url))
      }

      // 학교 게시판인 경우 (parent_id가 2)
      if (category.parent_id === 2) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        // 로그인하지 않은 경우
        if (userError || !user) {
          const response = NextResponse.json(
            { 
              message: "학교게시판을 사용하시려면 로그인과 학교인증이 필요합니다.",
              boardName: category.name
            },
            { status: 401 }
          )
          response.headers.set('X-Show-Auth-Modal', 'true')
          return response
        }

        // 학교 인증 체크
        const { data: verifications, error: verificationError } = await supabase
          .from('school_verifications')
          .select('school_id, status')
          .eq('user_id', user.id)
          .eq('status', 'verified')
          .not('verified_at', 'is', null)

        // 학교 인증이 없는 경우
        if (verificationError || !verifications || verifications.length === 0) {
          return NextResponse.redirect(new URL(`/unauthorized/${boardSlug}`, req.url))
        }

        // 다른 학교 인증된 경우
        const verifiedSchool = verifications[0]
        if (verifiedSchool.school_id !== category.id) {
          return NextResponse.redirect(new URL(`/unauthorized/${boardSlug}?reason=different_school`, req.url))
        }
      }
    }

    // auth 관련 경로는 처리하지 않음
    if (req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname.startsWith('/api/auth')) {
      return res
    }

    // 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트
    if (req.nextUrl.pathname === '/auth/login') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        return NextResponse.redirect(new URL('/', req.url))
      }
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
    '/board/:path*',
    '/board/:slug/write',
    '/auth/login',
    '/api/auth/callback/:path*'
  ]
}