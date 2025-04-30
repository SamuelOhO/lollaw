// app/test/page.tsx
import { createServerSupabase } from '@/utils/supabase/server'

export default async function TestPage() {
  const supabase = await createServerSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">🔍 SSR 세션 테스트</h1>
      <p><strong>세션:</strong></p>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
      <p><strong>에러:</strong></p>
      <pre className="bg-red-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
}