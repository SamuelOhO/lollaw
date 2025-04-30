'use client'

import { createClientSupabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import CommentSection from '@/components/comments/CommentSection'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  views: number
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

export default function PostPage({ params }: { params: { slug: string, id: string } }) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientSupabase()

  const fetchPost = async () => {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !post) {
      router.push('/404')
      return
    }

    setPost(post)

    // 좋아요 수 가져오기
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', params.id)

    setLikesCount(count || 0)
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (!user) {
      setIsLiked(false)
      return
    }

    try {
      const { data } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', params.id)
        .eq('user_id', user.id)
      
      setIsLiked(!!data)
    } catch (error) {
      console.error('좋아요 상태 확인 중 오류:', error)
      setIsLiked(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        // 먼저 게시글 데이터를 가져옵니다
        await fetchPost()
        
        // 조회수를 증가시킵니다 (한 번만)
        await supabase.rpc('increment_views', { post_id: parseInt(params.id) })
        
        // 사용자 정보와 좋아요 상태를 확인합니다
        await checkUser()
        
        // 변경된 게시글 데이터를 다시 가져옵니다
        if (isMounted) {
          await fetchPost()
        }
      } catch (error) {
        console.error('초기화 중 오류:', error)
      }
    }

    initialize()

    // 실시간 업데이트 구독
    const channel = supabase
      .channel('post_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${params.id}`
        },
        () => {
          if (isMounted) {
            fetchPost()
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      channel.unsubscribe()
    }
  }, [params.id])

  const handleLike = async () => {
    if (!user) {
      // TODO: 로그인 모달 표시
      return
    }

    if (isLiked) {
      // 좋아요 취소
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', params.id)
        .eq('user_id', user.id)
      setIsLiked(false)
      setLikesCount(prev => prev - 1)
    } else {
      // 좋아요 추가
      await supabase
        .from('likes')
        .insert([
          {
            post_id: params.id,
            user_id: user.id
          }
        ])
      setIsLiked(true)
      setLikesCount(prev => prev + 1)
    }
  }

  if (!post) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/board/${params.slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center justify-between mb-6 text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {post.profiles.avatar_url && (
                <img
                  src={post.profiles.avatar_url}
                  alt="프로필"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{post.profiles.display_name}</span>
            </div>
            <span>•</span>
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
            </time>
            {post.updated_at !== post.created_at && (
              <>
                <span>•</span>
                <span className="text-gray-500">
                  수정됨: {format(new Date(post.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">조회 {post.views}</span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>

        <div className="prose max-w-none">
          {post.content}
        </div>
      </article>

      <CommentSection postId={parseInt(params.id)} />
    </div>
  )
} 