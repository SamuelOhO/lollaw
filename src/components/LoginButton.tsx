// components/LoginButton.tsx
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { usePathname } from 'next/navigation'

export default function LoginButton() {
  const supabase = createClientComponentClient()
  const pathname = usePathname()

  const handleLogin = async () => {
    try {
      // 현재 페이지 경로 저장
      localStorage.setItem('previousPath', pathname)
      
      const { error } = await supabase.auth.signInWithOAuth({
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

      if (error) throw error
    } catch (error) {
      console.error('로그인 오류:', error)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      구글로 로그인
    </button>
  )
}