import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-10">로그인 후 이용해 주세요</div>
  }

  return (
    <div className="p-10">
      <h1 className="text-xl font-semibold">환영합니다, {user.email}님</h1>
    </div>
  )
}