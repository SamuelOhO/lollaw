import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-6">로그인이 필요합니다.</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">안녕하세요, {user.email}님!</h1>
    </div>
  )
}