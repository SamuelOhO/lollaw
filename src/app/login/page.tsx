// 'use client'

// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// export default function LoginPage() {
//   const supabase = createClientComponentClient()

//   const loginWithGoogle = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${location.origin}/auth/callback`, // ✅ 정확한 리디렉션
//         queryParams: {
//           response_type: 'code', // ✅ PKCE Code Flow
//         },
//       },
//     })
//   }

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <button
//         onClick={loginWithGoogle}
//         className="bg-blue-500 text-white px-4 py-2 rounded-xl"
//       >
//         구글로 로그인
//       </button>
//     </div>
//   )
// }

// app/login/page.tsx
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    try {
      // 기존 code verifier 제거
      localStorage.removeItem('supabase.auth.code_verifier')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            response_type: 'code'
          }
        }
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('로그인 오류:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        구글로 로그인
      </button>
    </div>
  )
}