'use client';

import { useState } from 'react';
import { format } from '@/utils/date';
import type { Comment } from '@/types/comment';
import Image from 'next/image';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number) => void;
  showReplyButton: boolean;
  user?: any;
  level?: number;
  onLike?: (commentId: number, isLiked: boolean) => void;
  onReport?: (commentId: number, isReported: boolean, reason: string) => void;
}

export default function CommentItem({ comment, onReply, showReplyButton, user, level = 0, onLike, onReport }: CommentItemProps) {
  const [showContent, setShowContent] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportInput, setShowReportInput] = useState(false);
  const [showReportCancelDialog, setShowReportCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      if (onLike) await onLike(comment.id, comment.isLiked ?? false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user || isLoading) return;
    
    if (comment.isReported) {
      setShowReportCancelDialog(true);
      return;
    }

    if (!showReportInput) {
      setShowReportInput(true);
      return;
    }

    if (onReport && reportReason.trim()) {
      setIsLoading(true);
      try {
        await onReport(comment.id, false, reportReason);
        setShowReportInput(false);
        setReportReason('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReportCancel = async () => {
    if (!user || isLoading) return;
    setIsLoading(true);
    try {
      if (onReport) await onReport(comment.id, true, '');
      setShowReportCancelDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isHidden = (comment.report_count ?? 0) >= 10 && !showContent;

  return (
    <div className={`mt-4 ${level > 0 ? 'ml-8' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {comment.profiles?.avatar_url ? (
            <Image
              src={comment.profiles.avatar_url}
              alt={comment.profiles.display_name || 'User avatar'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">
              {comment.profiles?.display_name || '익명'}
            </p>
            <span className="text-sm text-gray-500">
              {format(comment.created_at)}
            </span>
          </div>
          {/* 신고 10개 이상이면 내용 숨김 */}
          {isHidden ? (
            <div className="mt-1 text-sm text-gray-400">
              🚨 신고가 10회 이상 접수된 댓글입니다.{' '}
              <button className="underline text-blue-500" onClick={() => setShowContent(true)}>
                내용 보기
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
          )}
          <div className="mt-2 flex gap-4 items-center">
            {/* 좋아요 버튼 */}
            <button
              className={`text-sm flex items-center gap-1 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleLike}
              disabled={!user || isLoading}
              aria-label="좋아요"
            >
              ♥ {comment.likes_count ?? 0}
            </button>
            {/* 신고 버튼 */}
            <button
              className={`text-sm flex items-center gap-1 ${comment.isReported ? 'text-orange-500' : 'text-gray-500'} hover:text-orange-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleReport}
              disabled={!user || isLoading}
              aria-label="신고"
            >
              🚩 {comment.report_count ?? 0}
            </button>
            {showReplyButton && user && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                답글
              </button>
            )}
          </div>
          {/* 신고 사유 입력창 */}
          {showReportInput && !comment.isReported && (
            <div className="mt-2 flex gap-2 items-center">
              <input
                type="text"
                className="border px-2 py-1 rounded text-sm"
                placeholder="신고 사유를 입력하세요"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              />
              <button
                className={`text-xs px-2 py-1 bg-orange-500 text-white rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleReport}
                disabled={!reportReason.trim() || isLoading}
              >
                신고 제출
              </button>
              <button
                className="text-xs px-2 py-1 bg-gray-200 rounded"
                onClick={() => setShowReportInput(false)}
                disabled={isLoading}
              >
                취소
              </button>
            </div>
          )}
          {/* 신고 취소 다이얼로그 */}
          {showReportCancelDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">신고 취소</h3>
                <p className="text-sm text-gray-500 mb-6">신고를 취소하시겠습니까?</p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={() => setShowReportCancelDialog(false)}
                    disabled={isLoading}
                  >
                    아니요
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleReportCancel}
                    disabled={isLoading}
                  >
                    예
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply} 
              showReplyButton={false} 
              user={user} 
              level={level + 1} 
              onLike={onLike}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
