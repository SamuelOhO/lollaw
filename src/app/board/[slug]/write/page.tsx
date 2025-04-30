// app/board/[slug]/write/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface WritePageProps {
  params: Promise<{ slug: string }>
}

export default function WritePage({ params }: WritePageProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [category, setCategory] = useState<any>(null)
  const { slug } = React.use(params)
  

  useEffect(() => {

    const fetchCategory = async () => {
      // 현재 카테고리 정보 가져오기
      const { data: category, error } = await supabase
        .from('categories')
        .select('*, parent:parent_id(*)')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('카테고리 로딩 오류:', error)
        router.push('/')
        return
      }

      setCategory(category)

      // 권한 체크
      const { data: { session } } = await supabase.auth.getSession()
      if (category.requires_auth && !session) {
        router.push('/auth/login')
      }
    }

    fetchCategory()
  }, [slug, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      // 게시글 저장
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          category_id: category.id,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (postError) throw postError

      router.push(`/board/${slug}`)
      router.refresh()
      
    } catch (error) {
      console.error('글 작성 오류:', error)
      alert('글 작성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!category) {
    return <div>로딩중...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{category.name} 글쓰기</h1>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </form>
  )
}