'use client'

import { createClientSupabase } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import WriteButton from '@/components/board/WriteButton'
import type { BoardPageProps, Category, Post } from '@/types/board'
import { useEffect, useState } from 'react'

export default function BoardPage({ 
  params: { slug },
  searchParams 
}: BoardPageProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 20
  const supabase = createClientSupabase()

  useEffect(() => {
    const fetchData = async () => {
      // 카테고리 조회
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!categoryData) {
        notFound()
        return
      }
      setCategory(categoryData as Category)

      // 게시글 조회
      const start = (page - 1) * limit
      const end = start + limit - 1

      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          category_id,
          user_id,
          views,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          comments:comments(count),
          likes:likes(count)
        `)
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false })
        .range(start, end)

      if (postsData) {
        // 각 게시글의 좋아요 수를 개별적으로 가져옵니다
        const postsWithLikes = await Promise.all(
          postsData.map(async (post) => {
            const { count } = await supabase
              .from('likes')
              .select('*', { count: 'exact' })
              .eq('post_id', post.id)
            
            return {
              ...post,
              likes: { count: count || 0 }
            }
          })
        )
        setPosts(postsWithLikes as unknown as Post[])
      }
    }

    fetchData()

    // 실시간 업데이트 구독
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `category_id=eq.${category?.id}`
      }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [slug, page, limit, category?.id])

  if (!category) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <WriteButton category={category} />
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${category.slug}/${post.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  {post.title}
                  {post.comments.count > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      [{post.comments.count}]
                    </span>
                  )}
                </h2>
                <div className="mt-2 text-sm text-gray-600">
                  <span>{post.profiles.display_name}</span>
                  <span className="mx-2">•</span>
                  <span>{format(new Date(post.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes?.count || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}