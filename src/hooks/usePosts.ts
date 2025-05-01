import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Post } from '@/types/board'

export function usePosts(categoryId: number | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      if (!categoryId) return

      try {
        setLoading(true)
        setError(null)

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            created_at,
            updated_at,
            views,
            user_id,
            category_id,
            profiles (
              display_name,
              avatar_url
            ),
            comments:comments(count),
            likes:likes(count)
          `)
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false })

        if (postsError) {
          console.error('Posts fetch error:', postsError)
          throw new Error('게시글을 가져오는데 실패했습니다.')
        }

        if (postsData) {
          const formattedPosts = postsData.map(post => ({
            ...post,
            profiles: {
              display_name: post.profiles?.[0]?.display_name ?? null,
              avatar_url: post.profiles?.[0]?.avatar_url ?? null
            },
            comments: { count: post.comments[0]?.count ?? 0 },
            likes: { count: post.likes[0]?.count ?? 0 }
          })) as Post[]
          setPosts(formattedPosts)
        }

      } catch (error) {
        console.error('Error fetching posts:', error)
        setError(error instanceof Error ? error.message : '게시글을 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()

    // 실시간 업데이트 구독
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `category_id=eq.${categoryId}`
      }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [categoryId])

  return { posts, loading, error }
} 