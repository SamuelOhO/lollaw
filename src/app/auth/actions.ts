'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signInWithGoogle() {
  const cookieStore = cookies()
  const supabase = await createClient()

  // 현재 환경에 따른 URL 설정
  const siteUrl = process.env.NODE_ENV === 'production'
    ? 'https://lollaw.vercel.app'
    : 'http://localhost:3000'

  // 현재 경로를 intended_path로 저장
  const currentPath = cookieStore.get('next-url')?.value
  if (currentPath && currentPath !== '/auth/login') {
    cookieStore.set('intended_path', currentPath, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    console.error('OAuth error:', error)
    return redirect('/auth/login?error=google_signin_error')
  }

  if (!data.url) {
    return redirect('/auth/login?error=no_oauth_url')
  }

  return redirect(data.url)
} 