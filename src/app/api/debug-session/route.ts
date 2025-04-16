// app/api/debug-session/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })


//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll().map(c => ({
//             name: c.name,
//             value: c.value
//           }))
//         },
//         setAll() {}
//       }
//     }
//   )

  const { data: { session } } = await supabase.auth.getSession()

  return NextResponse.json({ session })
}