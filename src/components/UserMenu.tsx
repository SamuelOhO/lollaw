// components/UserMenu.tsx
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

interface UserProfile {
  display_name?: string;
}

export default function UserMenu() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const [, setSession] = useState<any>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.user.id)
            .single()

          const displayName = profile?.display_name || session.user.email?.split('@')[0] || '사용자'
          setProfile({ display_name: displayName })
        }
      } catch (error) {
        console.error('프로필 로딩 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [supabase])

  const handleLogin = async () => {
    try {
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse">로딩중...</div>
  }

  if (!profile) {
    return (
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        구글로 로그인
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <p className="text-gray-700">
        안녕하세요, <span className="font-semibold">{profile.display_name}</span>님!
      </p>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-600 hover:text-gray-900 transition"
      >
        로그아웃
      </button>
    </div>
  )
}