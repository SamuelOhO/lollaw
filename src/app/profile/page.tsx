import { createServerSupabase } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">안녕하세요, {user.email}님!</h1>
    </div>
  )
}