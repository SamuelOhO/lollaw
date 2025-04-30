'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import AuthRequiredModal from '../auth/AuthRequiredModal'

interface Comment {
  id: number
  content: string
  created_at: string
  updated_at: string
  user_id: string
  post_id: number
  parent_id: number | null
  profiles: {
    display_name: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: number
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const supabase = createClientSupabase()

  useEffect(() => {
    fetchComments()
    checkUser()

    // 실시간 구독 설정
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const organizeComments = (flatComments: Comment[]): Comment[] => {
    // 최상위 댓글과 대댓글을 분리
    const parentComments: Comment[] = []
    const childComments = new Map<number, Comment[]>()

    // 댓글을 parent_id 기준으로 분류
    flatComments.forEach(comment => {
      if (comment.parent_id === null) {
        parentComments.push({ ...comment, replies: [] })
      } else {
        if (!childComments.has(comment.parent_id)) {
          childComments.set(comment.parent_id, [])
        }
        childComments.get(comment.parent_id)?.push(comment)
      }
    })

    // 각 부모 댓글에 대댓글을 시간순으로 정렬하여 추가
    parentComments.forEach(parent => {
      const replies = childComments.get(parent.id) || []
      parent.replies = replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })

    // 최상위 댓글도 시간순 정렬
    return parentComments.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  const fetchComments = async () => {
    console.log('Fetching comments for post ID:', postId, typeof postId)
    
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('댓글을 불러오는 중 오류가 발생했습니다:', commentsError)
      return
    }

    if (!commentsData?.length) {
      setComments([])
      return
    }

    const userIds = [...new Set(commentsData.map(comment => comment.user_id))]
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('프로필 정보를 불러오는 중 오류가 발생했습니다:', profilesError)
      return
    }

    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      profiles: profilesData?.find(profile => profile.id === comment.user_id) || {
        display_name: '알 수 없음',
        avatar_url: null
      }
    }))

    // 댓글을 계층 구조로 정리
    const organizedComments = organizeComments(commentsWithProfiles)
    console.log('Organized comments:', organizedComments)
    setComments(organizedComments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!newComment.trim()) return

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          content: newComment,
          post_id: postId,
          user_id: user.id
        }
      ])

    if (error) {
      console.error('댓글 작성 중 오류가 발생했습니다:', error)
      return
    }

    setNewComment('')
    await fetchComments() // 즉시 새로고침
  }

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent })
      .eq('id', commentId)
      .eq('user_id', user?.id)

    if (error) {
      console.error('댓글 수정 중 오류가 발생했습니다:', error)
      return
    }

    setEditingCommentId(null)
    setEditContent('')
    await fetchComments() // 즉시 새로고침
  }

  const handleDelete = async (commentId: number) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user?.id)

    if (error) {
      console.error('댓글 삭제 중 오류가 발생했습니다:', error)
      return
    }

    await fetchComments() // 즉시 새로고침
  }

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleReply = async (parentId: number) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!replyContent.trim()) return

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          content: replyContent,
          post_id: postId,
          user_id: user.id,
          parent_id: parentId
        }
      ])

    if (error) {
      console.error('대댓글 작성 중 오류가 발생했습니다:', error)
      return
    }

    setReplyContent('')
    setReplyingTo(null)
    await fetchComments()
  }

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : 'mb-6'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {comment.profiles?.avatar_url && (
            <img
              src={comment.profiles.avatar_url}
              alt="프로필"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="font-medium">{comment.profiles?.display_name || '알 수 없음'}</span>
          <span className="text-sm text-gray-500">
            {format(new Date(comment.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-sm text-gray-500">(수정됨)</span>
          )}
        </div>
        {user?.id === comment.user_id && (
          <div className="space-x-2">
            <button
              onClick={() => startEditing(comment)}
              className="text-blue-500 hover:text-blue-600"
            >
              수정
            </button>
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-red-500 hover:text-red-600"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      
      {editingCommentId === comment.id ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none h-24"
          />
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleEdit(comment.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
            <button
              onClick={() => setEditingCommentId(null)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700">{comment.content}</p>
          
          {!isReply && (
            <div className="mt-2">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                답글 달기
              </button>
            </div>
          )}

          {replyingTo === comment.id && (
            <div className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요"
                className="w-full p-2 border rounded-lg resize-none h-20"
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleReply(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent('')
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h3>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성해주세요"
          className="w-full p-2 border rounded-lg resize-none h-24"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          댓글 작성
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="댓글을 작성하려면 로그인이 필요합니다."
      />
    </div>
  )
} 