// // middleware.ts
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })

//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()

//     // auth/callback은 처리하지 않음
//     if (req.nextUrl.pathname.startsWith('/auth/callback')) {
//       return res
//     }

//     // /login 페이지 접근 시 세션이 있으면 / 로 리다이렉트
//     if (req.nextUrl.pathname === '/login' && session) {
//       return NextResponse.redirect(new URL('/', req.url))
//     }

//     // /community 접근 시 세션이 없으면 /login으로 리다이렉트
//     if (req.nextUrl.pathname.startsWith('/community') && !session) {
//       return NextResponse.redirect(new URL('/login', req.url))
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
//     '/login',
//     '/auth/callback'
//   ]
// }

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
    
//     return res
//   } catch (error) {
//     console.error('미들웨어 에러:', error)
//     return res
//   }
// }

// // middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    // console.log('🛡️ Middleware 실행됨:', req.nextUrl.pathname)
    try {
      const supabase = createMiddlewareClient({ req, res })
      
      // auth/callback은 처리하지 않음
      if (req.nextUrl.pathname.startsWith('/auth/callback')) {
        return res
      }
      
      // 세션 새로고침 - 여기서 중요한 것은 getSession 호출 자체가 세션을 새로고침함
      await supabase.auth.getSession()
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('💾 Middleware 세션:', session)
      // 변경된 쿠키가 포함된 응답을 반환
      return res
    } catch (error) {
      console.error('미들웨어 에러:', error)
      return res
    }
  }

// export const config = {
//   matcher: [
//     '/community/:path*',
//     '/board/:path*',
//     '/login',
//     '/auth/callback'
//   ]
// }


export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  }
