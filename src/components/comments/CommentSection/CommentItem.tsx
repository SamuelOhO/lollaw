'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommentWithProfile } from '@/types';

interface CommentItemProps {
  comment: CommentWithProfile;
  onEdit?: (commentId: number, content: string) => void;
  onDelete?: (commentId: number) => void;
  onReply?: (parentId: number, content: string) => void;
  onLike?: (commentId: number) => void;
  onReport?: (commentId: number, reason: string) => void;
  onCancelReport?: (commentId: number) => void;
  currentUserId?: string;
  depth?: number;
}

const CommentItem = memo(function CommentItem({
  comment,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onReport,
  onCancelReport,
  currentUserId,
  depth = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // 메모이제이션된 계산값들
  const isOwner = useMemo(() => currentUserId === comment.user_id, [currentUserId, comment.user_id]);
  const canReply = useMemo(() => depth < 2, [depth]); // 최대 2단계까지만 대댓글 허용
  const formattedDate = useMemo(() => 
    format(new Date(comment.created_at), 'PPp', { locale: ko }),
    [comment.created_at]
  );

  const handleEdit = useCallback(async () => {
    if (onEdit && editContent.trim()) {
      await onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  }, [onEdit, editContent, comment.id]);

  const handleReply = useCallback(async () => {
    if (onReply && replyContent.trim()) {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  }, [onReply, replyContent, comment.id]);

  const handleLike = useCallback(async () => {
    if (onLike) {
      await onLike(comment.id);
    }
  }, [onLike, comment.id]);

  const handleReport = useCallback(async () => {
    if (onReport && reportReason.trim()) {
      await onReport(comment.id, reportReason.trim());
      setReportReason('');
      setShowReportModal(false);
    }
  }, [onReport, reportReason, comment.id]);

  const handleCancelReport = useCallback(async () => {
    if (onCancelReport) {
      await onCancelReport(comment.id);
    }
  }, [onCancelReport, comment.id]);

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} border-l-2 border-gray-100 pl-4`}>
      <div className="flex items-start space-x-3">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          {comment.profiles?.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.display_name || '익명'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {comment.profiles?.display_name?.[0] || '?'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* 작성자 정보 */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">
              {comment.profiles?.display_name || '익명'}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(comment.created_at), 'PPP p', { locale: ko })}
            </p>
          </div>

          {/* 댓글 내용 */}
          <div className="mt-2">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{comment.content}</p>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="mt-2 flex items-center space-x-4">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLike}
              className={`text-sm flex items-center space-x-1 ${
                comment.is_liked
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <span>♥</span>
              <span>{comment.likes_count ?? 0}</span>
            </button>

            {/* 신고 버튼 */}
            {!isOwner && (
              <button
                onClick={comment.is_reported ? handleCancelReport : () => setShowReportModal(true)}
                className={`text-sm ${
                  comment.is_reported
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-orange-500'
                }`}
              >
                {comment.is_reported ? '신고 취소' : '신고'}
              </button>
            )}

            {/* 답글 버튼 */}
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-gray-500 hover:text-blue-500"
              >
                답글
              </button>
            )}

            {/* 수정/삭제 버튼 (작성자만) */}
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-500 hover:text-blue-500"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete?.(comment.id)}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  삭제
                </button>
              </>
            )}
          </div>

          {/* 답글 작성 폼 */}
          {isReplying && (
            <div className="mt-4 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 작성하세요..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleReply}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 신고 모달 */}
          {showReportModal && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium mb-2">신고 사유를 선택해주세요</h4>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="신고 사유를 입력하세요..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={2}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleReport}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  신고하기
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 대댓글들 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
              onCancelReport={onCancelReport}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CommentItem;