// app/api/debug-session/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(c => ({
            name: c.name,
            value: c.value
          }))
        },
        setAll() {}
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  return NextResponse.json({ session })
}