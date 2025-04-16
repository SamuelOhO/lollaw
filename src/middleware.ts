// // middleware.ts

// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })
//   await supabase.auth.getSession()
//   return res
// }

// export const config = {
//   matcher: ["/community/:path*", "/profile", "/"],
// }

// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })
//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   // 로그인된 사용자가 /login 페이지에 접근하려고 할 때
//   if (session && req.nextUrl.pathname === '/login') {
//     return NextResponse.redirect(new URL('/community', req.url))
//   }

//   // 로그인되지 않은 사용자가 보호된 경로에 접근하려고 할 때
//   if (!session && req.nextUrl.pathname.startsWith('/community')) {
//     return NextResponse.redirect(new URL('/login', req.url))
//   }

//   return res
// }

// export const config = {
//   matcher: ["/community/:path*", "/profile", "/", "/login"]
// }

// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // auth/callback은 처리하지 않음
    if (req.nextUrl.pathname.startsWith('/auth/callback')) {
      return res
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // /login 페이지 접근 시 세션이 있으면 /community로 리다이렉트
    if (req.nextUrl.pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/community', req.url))
    }

    // /community 접근 시 세션이 없으면 /login으로 리다이렉트
    if (req.nextUrl.pathname.startsWith('/community') && !session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (error) {
    console.error('미들웨어 에러:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/community/:path*',
    '/login',
    '/auth/callback'
  ]
}