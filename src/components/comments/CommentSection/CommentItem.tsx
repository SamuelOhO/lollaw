'use client';

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Comment } from '@/types'
import CommentActions from './CommentActions'

interface CommentItemProps {
  comment: Comment
  onUpdate: (commentId: number, content: string) => void
  onDelete: (commentId: number) => void
  onReply: (parentId: number, content: string) => void
  onLike: (commentId: number) => void
  onReport: (commentId: number) => void
  onReportCancel: (commentId: number) => void
  isReply?: boolean
}

export default function CommentItem({ 
  comment, 
  onUpdate, 
  onDelete, 
  onReply, 
  onLike, 
  onReport, 
  onReportCancel, 
  isReply = false 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const { user } = useAuth()

  const isOwner = user?.id === comment.user_id

  const handleUpdateSubmit = () => {
    if (editContent.trim() !== comment.content) {
      onUpdate(comment.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      onDelete(comment.id)
    }
  }

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      const parentId = isReply ? comment.parent_id || comment.id : comment.id
      onReply(parentId, replyContent.trim())
      setReplyContent('')
      setIsReplying(false)
    }
  }

  const handleLike = () => {
    if (!user) return
    onLike(comment.id)
  }

  const handleReportClick = () => {
    if (!user) return
    onReport(comment.id)
  }

  // 신고 10개 이상이면 내용 숨김
  const isHidden = (comment.report_count ?? 0) >= 10

  if (comment.is_hidden || isHidden) {
    return (
      <div 
        id={`comment-${comment.id}`}
        className={`py-3 text-gray-500 italic transition-all duration-500 ${isReply ? 'ml-8' : ''}`}
      >
        🚨 신고로 인해 숨김 처리된 댓글입니다.
      </div>
    )
  }

  return (
    <div 
      id={`comment-${comment.id}`}
      className={`border-b border-gray-100 py-4 transition-all duration-500 ${isReply ? 'ml-8 border-l-2 border-l-gray-200 pl-4' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {comment.avatar_url ? (
            <img
              src={comment.avatar_url}
              alt={comment.display_name || '익명'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {comment.display_name?.[0] || '?'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {comment.display_name || '익명'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString('ko-KR')}
              </span>
            </div>
            
            {isOwner && (
              <CommentActions 
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
              />
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateSubmit}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">
                {comment.content}
              </p>
              
              {/* 좋아요/신고/답글 버튼 */}
              <div className="flex items-center gap-4">
                {/* 좋아요 버튼 */}
                <button
                  onClick={handleLike}
                  disabled={!user}
                  className={`text-sm flex items-center gap-1 transition-colors ${
                    comment.isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="좋아요"
                >
                  ♥ {comment.likes_count ?? 0}
                </button>

                {/* 신고 버튼 */}
                <button
                  onClick={handleReportClick}
                  disabled={!user}
                  className={`text-sm flex items-center gap-1 transition-colors ${
                    comment.isReported 
                      ? 'text-orange-500 hover:text-orange-600' 
                      : 'text-gray-500 hover:text-orange-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="신고"
                >
                  🚩 {comment.report_count ?? 0}
                </button>

                {/* 답글 버튼 */}
                {user && !isReplying && !isReply && (
                  <button
                    onClick={() => setIsReplying(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    답글 달기
                  </button>
                )}
              </div>
            </>
          )}

          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleReplySubmit}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!replyContent.trim()}
                >
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
              onReportCancel={onReportCancel}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
} 