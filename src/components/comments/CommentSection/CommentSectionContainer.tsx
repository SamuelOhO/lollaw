'use client';

import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import CommentSectionView from './CommentSectionView';

interface CommentSectionContainerProps {
  postId: number;
}

export default function CommentSectionContainer({ postId }: CommentSectionContainerProps) {
  const { user } = useAuth();
  
  const {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    reportComment,
    cancelCommentReport,
  } = useComments(postId);

  // postId가 유효하지 않은 경우 처리
  if (!postId || isNaN(postId)) {
    return (
      <div className="text-center py-8 text-gray-500">
        유효하지 않은 게시글입니다.
      </div>
    );
  }

  return (
    <CommentSectionView
      postId={postId}
      comments={comments || []}
      loading={loading}
      error={error}
      onAddComment={addComment}
      onUpdateComment={updateComment}
      onDeleteComment={deleteComment}
      onToggleLike={toggleCommentLike}
      onReportComment={reportComment}
      onCancelReport={cancelCommentReport}
      currentUserId={user?.id}
    />
  );
} 