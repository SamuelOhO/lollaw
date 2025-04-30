// // app/board/[slug]/page.tsx
import { createServerSupabase } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BoardList from '@/components/board/BoardList'
import WriteButton from '@/components/board/WriteButton'

interface BoardPageProps {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const slug = (await params).slug
  if (!slug) notFound()
  
  const supabase = await createServerSupabase()

  try {
    // 1. 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      console.error('카테고리 로딩 오류:', categoryError)
      notFound()
    }

    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('category_id', category.id)
      .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
        <div className="mb-6 flex justify-end">
          <WriteButton 
            isLoggedIn={!!user} 
            boardSlug={slug}
          />
        </div>
        <BoardList posts={posts || []} />
      </div>
    )

  } catch (error) {
    console.error('페이지 로딩 오류:', error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500">페이지를 불러오는데 실패했습니다.</p>
      </div>
    )
  }
}