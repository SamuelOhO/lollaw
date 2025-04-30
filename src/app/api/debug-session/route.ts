// app/api/debug-session/route.ts
import { createServerSupabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabase()

  const { data: { session } } = await supabase.auth.getSession()

  return NextResponse.json({ session })
}