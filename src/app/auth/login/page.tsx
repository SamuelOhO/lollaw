'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { useRouter } from 'next/navigation'

export default function LoginPage() {
  // const router = useRouter()
  const supabase = createClientComponentClient()

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            response_type: 'code'
          },
        },
      })

      if (error) {
        console.error('Google 로그인 에러:', error)
      } else {
        console.log('로그인 성공:', data)
      }
    } catch (error) {
      console.error('로그인 처리 에러:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <img src="/google-logo.svg" alt="Google" className="w-6 h-6" />
        Google로 로그인
      </button>
    </div>
  )
}