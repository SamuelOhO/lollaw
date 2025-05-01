'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/auth/login?error=invalid_credentials')
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/auth/login?error=invalid_signup')
  }

  redirect('/auth/login?message=check_email')
}

export async function handleAuthCallback(code: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
  } catch (error) {
    console.error('Auth callback error:', error)
    return { error: 'Authentication failed' }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'Failed to sign out' }
  }

  redirect('/')
} 