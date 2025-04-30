// // src/app/page.tsx
import { createServerSupabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import CategoryList from '@/components/CategoryList'

export default async function Home() {
  // 비동기 함수로 분리하여 실행
  async function getData() {
    const supabase = await createServerSupabase()
    
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
    
    return data
  }
  
  const categories = await getData()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories?.map((category) => (
          <CategoryList key={category.id} category={category} />
        ))}
      </div>
      {/* <div className="mt-8">session: {session}</div> */}
    </main>
  )
}