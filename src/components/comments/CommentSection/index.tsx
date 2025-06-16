'use client';

import { Comment } from '@/types';
import { useComments } from '@/hooks/useComments';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useEffect, useState } from 'react';
import { ReportModal } from '@/components/modals/ReportModal';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
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
    refetchComments
  } = useComments(postId);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);

  // 댓글로 스크롤하는 함수
  const scrollToComment = (commentId: number) => {
    setTimeout(() => {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // 스크롤 후 잠깐 하이라이트 효과
        element.classList.add('bg-blue-50', 'border-blue-200');
        setTimeout(() => {
          element.classList.remove('bg-blue-50', 'border-blue-200');
        }, 2000);
      }
    }, 100);
  };

  const handleAddComment = async (commentData: any) => {
    const newCommentId = await addComment(commentData);
    if (newCommentId) {
      scrollToComment(newCommentId);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    const newCommentId = await addComment({
      content,
      post_id: postId,
      parent_id: parentId,
    });
    if (newCommentId) {
      scrollToComment(newCommentId);
    }
  };

  const handleReportClick = (commentId: number) => {
    // 해당 댓글을 찾아서 이미 신고했는지 확인
    const findComment = (comments: Comment[], id: number): Comment | null => {
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

    const targetComment = findComment(comments, commentId);
    
    if ((targetComment as any)?.isReported) {
      // 이미 신고한 댓글이면 취소 확인 다이얼로그 표시
      const shouldCancel = confirm(
        '이미 신고한 댓글입니다.\n신고를 취소하시겠습니까?\n\n취소하면 신고 내역이 삭제됩니다.'
      );
      
      if (shouldCancel) {
        handleReportCancel(commentId);
      }
      return;
    }

    // 새로 신고하는 경우 ReportModal 열기
    setReportTargetId(commentId);
    setShowReportModal(true);
  };

  const handleReportCancel = async (commentId: number) => {
    try {
      await cancelCommentReport(commentId);
      // 신고 취소 후 데이터 새로고침하여 최신 상태 반영
      setTimeout(() => {
        refetchComments();
      }, 500);
    } catch (error) {
      console.error('신고 취소 중 오류:', error);
    }
  };

  const handleReportSubmit = async (reason: string) => {
    if (reportTargetId) {
      await reportComment(reportTargetId, reason);
      setShowReportModal(false);
      setReportTargetId(null);
      // 신고 후에도 데이터 새로고침
      setTimeout(() => {
        refetchComments();
      }, 500);
    }
  };

  // 전체 댓글 개수 계산 (대댓글 포함)
  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);
  };

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        댓글을 불러오는 중 오류가 발생했습니다: {error}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-semibold">댓글 {getTotalCommentCount(comments)}개</h3>
      
      <CommentForm onSubmit={handleAddComment} />
      
      {loading ? (
        <div className="text-center py-4">댓글을 불러오는 중...</div>
      ) : (
        <CommentList 
          comments={comments} 
          onUpdate={updateComment}
          onDelete={deleteComment}
          onReply={handleReply}
          onLike={toggleCommentLike}
          onReport={handleReportClick}
          onReportCancel={handleReportCancel}
        />
      )}

      {showReportModal && reportTargetId && (
        <ReportModal
          targetId={reportTargetId}
          targetType="comment"
          onSubmit={handleReportSubmit}
          onClose={() => {
            setShowReportModal(false);
            setReportTargetId(null);
          }}
        />
      )}
    </div>
  );
} 