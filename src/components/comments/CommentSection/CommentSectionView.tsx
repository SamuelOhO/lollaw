'use client';

import { useState } from 'react';
import { CommentWithProfile } from '@/types';
import CommentList from './CommentList';
import CommentItem from './CommentItem';
import { logError } from '@/utils/error-handler';

// 간단한 댓글 작성 폼 컴포넌트
function SimpleCommentForm({ 
  onSubmit, 
  placeholder = "댓글을 작성해주세요..." 
}: { 
  onSubmit: (content: string) => Promise<number | null>; 
  placeholder?: string; 
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      logError(error, 'Comment submit error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '작성 중...' : '댓글 작성'}
        </button>
      </div>
    </form>
  );
}

interface CommentSectionProps {
  postId: number;
  comments: CommentWithProfile[];
  loading: boolean;
  error: string | null;
  onAddComment: (content: string, parentId?: number) => Promise<number | null>;
  onUpdateComment: (commentId: number, content: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleLike: (commentId: number) => Promise<void>;
  onReportComment: (commentId: number, reason: string) => Promise<void>;
  onCancelReport: (commentId: number) => Promise<void>;
  currentUserId?: string;
}

export default function CommentSection({
  postId,
  comments,
  loading,
  error,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onToggleLike,
  onReportComment,
  onCancelReport,
  currentUserId,
}: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // 특정 댓글 찾기 (재귀적으로)
  const findComment = (comments: CommentWithProfile[], id: number): CommentWithProfile | null => {
    for (const comment of comments) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 답글 작성 핸들러
  const handleReply = async (parentId: number, content: string) => {
    const commentId = await onAddComment(content, parentId);
    if (commentId) {
      setReplyingTo(null);
    }
    return commentId;
  };

  // 메인 댓글 작성 핸들러
  const handleMainComment = async (content: string) => {
    return await onAddComment(content);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  // 전체 댓글 수 계산 (대댓글 포함)
  const getTotalCommentCount = (comments: CommentWithProfile[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
  };

  const totalComments = getTotalCommentCount(comments);

  return (
    <div className="mt-8">
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 {totalComments}개
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <div className="mb-8">
        <SimpleCommentForm
          onSubmit={handleMainComment}
          placeholder="댓글을 작성해주세요..."
        />
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={onUpdateComment}
              onDelete={onDeleteComment}
              onReply={handleReply}
              onLike={onToggleLike}
              onReport={onReportComment}
              onCancelReport={onCancelReport}
              currentUserId={currentUserId}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
} 