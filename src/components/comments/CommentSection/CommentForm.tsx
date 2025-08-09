'use client';

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logError } from '@/utils/error-handler'

interface CommentFormProps {
  onSubmit: (comment: { content: string; post_id: number }) => Promise<void>
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        content: content.trim(),
        post_id: 0, // 이 값은 useComments에서 실제 postId로 처리됨
      })
      setContent('')
    } catch (error) {
      logError(error, 'Comment form submit error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4 text-center bg-gray-50 rounded-lg">
        댓글을 작성하려면 로그인이 필요합니다.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!content.trim() || isSubmitting}
      >
        {isSubmitting ? '작성 중...' : '댓글 작성'}
      </button>
    </form>
  )
} 