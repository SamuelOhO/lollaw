"use client"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={loginWithGoogle}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
      >
        구글로 로그인
      </button>
    </div>
  )
}