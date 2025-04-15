// src/app/auth/callback/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.getUser() // 세션 갱신
  return NextResponse.redirect(new URL("/community", request.url))
}