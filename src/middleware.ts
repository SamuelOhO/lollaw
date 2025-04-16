// // middleware.ts
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
  
//   try {
//     const supabase = createMiddlewareClient({ req, res })
    
//     // auth/callback은 처리하지 않음
//     if (req.nextUrl.pathname.startsWith('/auth/callback')) {
//       return res
//     }
    
//     // 세션 새로고침
//     const { data: { session } } = await supabase.auth.getSession()
//     // console.log('💾 Middleware 세션:', session)
//     // 세션이 있는 경우 쿠키 설정
//     if (session) {
//       res.cookies.set('sb-auth-token', session.access_token, {
//         sameSite: 'lax',
//         secure: process.env.NODE_ENV === 'production',
//         path: '/',
//         maxAge: 60 * 60 * 24 * 7 // 7일
//       })
//     }
    
//     return res
//   } catch (error) {
//     console.error('미들웨어 에러:', error)
//     return res
//   }
// }

// export const config = {
//   matcher: [
//     '/community/:path*',
//     '/board/:path*',
//     '/login',
//     '/auth/callback'
//   ]
// }

// //     export const config = {
// //         matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// //   }

// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })

//   try {
//     // 세션 새로고침
//     const { data: { session } } = await supabase.auth.getSession()

//     // 세션이 있을 때 쿠키 설정 강화
//     if (session) {
//       res.cookies.set('sb-access-token', session.access_token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge: 60 * 60 * 24 * 7 // 7일
//       })

//       res.cookies.set('sb-refresh-token', session.refresh_token!, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge: 60 * 60 * 24 * 7 // 7일
//       })
//     }

//     return res
//   } catch (error) {
//     console.error('미들웨어 에러:', error)
//     return res
//   }
// }



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
    if (req.nextUrl.pathname.startsWith('/auth')) {
      return res
    }

    // 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리다이렉트
    if (req.nextUrl.pathname === '/auth/login' && session) {
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
    '/login',
    '/auth/callback'
    ]
}