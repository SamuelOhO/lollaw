// src/app/page.tsx

"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "@supabase/auth-helpers-react"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const session = useSession()

  useEffect(() => {
    if (session) {
      router.push("/community") // 로그인 완료 시 바로 커뮤니티로 이동
    }
  }, [session])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="p-6 flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">로그인 후 이용해 주세요</h1>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        구글로 로그인
      </button>
    </main>
  )
}