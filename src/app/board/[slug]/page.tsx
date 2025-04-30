import { createServerSupabase } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { BoardPageProps, Category, Post } from '@/types/board'
import BoardPageContent from './BoardPage'
import { Suspense } from 'react'
import BoardSkeleton from '@/components/board/BoardSkeleton'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/app/supabase'

// 카테고리 데이터 조회
async function getCategory(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as Category
}

// 게시글 데이터 조회
async function getPosts(supabase: SupabaseClient<Database>, categoryId: number, page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .range(start, end)

  if (error) {
    return []
  }

  return data as Post[]
}

export default async function Page({ 
  params: { slug },
  searchParams 
}: BoardPageProps) {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 20

  const supabase = await createServerSupabase()
  
  const category = await getCategory(supabase, slug)
  if (!category) notFound()

  const posts = await getPosts(supabase, category.id, page, limit)

  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardPageContent 
        category={category}
        posts={posts}
        page={page}
        limit={limit}
      />
    </Suspense>
  )
}