'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Comment } from '@/types/board'
import type { User } from '@supabase/supabase-js'

interface CommentSectionProps {
  postId: number
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchComments = async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('댓글 로딩 중 오류:', commentsError)
        return
      }

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))]
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds)

        if (profilesError) {
          console.error('프로필 로딩 중 오류:', profilesError)
          return
        }

        const profilesMap = new Map(
          profilesData?.map(profile => [profile.id, profile]) || []
        )

        const commentMap = new Map<number, Comment>()
        const rootComments: Comment[] = []

        commentsData.forEach(comment => {
          const profile = profilesMap.get(comment.user_id)
          const formattedComment: Comment = {
            ...comment,
            profiles: {
              display_name: profile?.display_name ?? null,
              avatar_url: profile?.avatar_url ?? null
            },
            replies: []
          }
          commentMap.set(formattedComment.id, formattedComment)

          if (comment.parent_id === null) {
            rootComments.push(formattedComment)
          } else {
            const parentComment = commentMap.get(comment.parent_id)
            if (parentComment) {
              parentComment.replies = parentComment.replies || []
              parentComment.replies.push(formattedComment)
            }
          }
        })

        setComments(rootComments)
      }
    }

    fetchComments()

    const channel = supabase
      .channel('comments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [postId])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment.trim(),
            post_id: postId,
            user_id: user.id,
            parent_id: replyTo
          }
        ])

      if (error) throw error

      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('댓글 작성 중 오류:', error)
    }
  }

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
    >
      <div className="flex items-start gap-3">
        {comment.profiles.avatar_url && (
          <img
            src={comment.profiles.avatar_url}
            alt="프로필"
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {comment.profiles.display_name || '익명'}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(comment.created_at || new Date()), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </span>
          </div>
          <p className="mt-1 text-gray-800">{comment.content}</p>
          {user && (
            <button
              onClick={() => setReplyTo(comment.id)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              답글 달기
            </button>
          )}
        </div>
      </div>
      {comment.replies?.map(reply => renderComment(reply, depth + 1))}
    </div>
  )

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">댓글 {comments.length}개</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-4">
            {user.user_metadata.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="프로필"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    답글 작성 중
                  </span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    취소
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                댓글 작성
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p>댓글을 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  )
} 