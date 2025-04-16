'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function WritePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('posts').insert({
      title,
      content,
      is_private: isPrivate,
      user_id: user?.id,
    })

    if (!error) {
      router.push('/community')
    } else {
      alert('글 작성 실패')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">글쓰기</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="내용"
          className="w-full border p-2 h-40 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span>비공개로 작성</span>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          작성 완료
        </button>
      </form>
    </div>
  )
}