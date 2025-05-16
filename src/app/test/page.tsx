// app/test/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">테스트 페이지</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
