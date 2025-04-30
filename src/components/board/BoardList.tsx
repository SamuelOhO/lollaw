'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/utils/supabase/client'
import { useDebouncedCallback } from 'use-debounce'
import type { Post, Category } from '@/types/board'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface BoardListProps {
  initialPosts: Post[]
  category: Category
}

export default function BoardList({ initialPosts, category }: BoardListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const supabase = createClientSupabase()

  // 실시간 업데이트 설정
  useEffect(() => {
    const channel = supabase
      .channel(`posts_${category.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `category_id=eq.${category.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as Post, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(post => post.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id ? { ...post, ...payload.new } : post
          ))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category.id, supabase])

  // 검색 디바운스 처리
  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (!term.trim()) {
      setPosts(initialPosts)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('category_id', category.id)
      .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setIsSearching(false)
  }, 300)

  // 검색어 변경 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearch(term)
  }

  const handlePostClick = (postId: number) => {
    router.push(`/board/${category.slug}/${postId}`)
  }

  return (
    <div className="space-y-6">
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="게시글 검색..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePostClick(post.id)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                {post.profiles.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.display_name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {post.profiles.display_name}
                </div>
                <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                    /
                    {new Date(post.created_at).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {post.title}
            </h3>
            {/* <p className="text-gray-600 line-clamp-3">{post.content}</p> */}
          </div>
        ))}
      </div>
    </div>
  )
} 