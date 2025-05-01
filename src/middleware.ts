// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 현재 URL을 쿠키에 저장 (auth 관련 경로 제외)
  if (!request.nextUrl.pathname.startsWith('/auth/')) {
    response.cookies.set({
      name: 'next-url',
      value: request.nextUrl.pathname,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            domain: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_DOMAIN : 'localhost',
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7일
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
            path: '/',
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // auth 관련 경로는 리다이렉트하지 않음
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth/') &&
    request.nextUrl.pathname !== '/'
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 게시판 경로 체크
  if (request.nextUrl.pathname.startsWith('/board/')) {
    const boardSlug = request.nextUrl.pathname.split('/')[2]

    // 게시판 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', boardSlug)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 학교 게시판인 경우 (parent_id가 2)
    if (category.parent_id === 2) {
      // 로그인하지 않은 경우
      if (!user) {
        return NextResponse.json(
          { 
            message: "학교게시판을 사용하시려면 로그인과 학교인증이 필요합니다.",
            boardName: category.name
          },
          { status: 401 }
        )
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
        return NextResponse.redirect(new URL(`/unauthorized/${boardSlug}`, request.url))
      }

      // 다른 학교 인증된 경우
      const verifiedSchool = verifications[0]
      if (verifiedSchool.school_id !== category.id) {
        return NextResponse.redirect(new URL(`/unauthorized/${boardSlug}?reason=different_school`, request.url))
      }
    }
  }

  return response
}

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
// }

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}