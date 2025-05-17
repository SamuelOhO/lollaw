'use client';

import { useState, useRef, useEffect } from 'react';
import { useComments } from '@/hooks/useComments';
import CommentItem from '@/components/molecules/comment-item';
import type { Comment } from '@/types/comment';

interface CommentSectionProps {
  postId: number;
}

function buildCommentTree(flatComments: Comment[]): Comment[] {
  const map = new Map<number, Comment & { replies: Comment[] }>();
  const roots: Comment[] = [];
  flatComments.forEach(comment => {
    map.set(comment.id, { ...comment, replies: [] });
  });
  flatComments.forEach(comment => {
    if (comment.parent_id !== null) {
      const parent = map.get(comment.parent_id);
      if (parent) {
        parent.replies.push(map.get(comment.id)!);
      }
    }
  });
  map.forEach(comment => {
    if (comment.parent_id === null) {
      roots.push(comment);
    }
  });
  return roots;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { comments, user, addComment, toggleLikeComment, toggleReportComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [scrollToId, setScrollToId] = useState<number | null>(null);

  // 댓글 DOM 참조
  const commentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (scrollToId && commentRefs.current[scrollToId]) {
      commentRefs.current[scrollToId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollToId(null);
    }
  }, [scrollToId, comments]);

  const handleSubmit = async () => {
    if (newComment.trim()) {
      const created = await addComment(newComment, replyingTo);
      setNewComment('');
      setReplyingTo(null);
      if (created && typeof created === 'object' && 'id' in created) {
        setScrollToId(created.id as number);
      }
    }
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
  };

  // 좋아요 핸들러
  const handleLike = (commentId: number, isLiked: boolean) => {
    toggleLikeComment(commentId, isLiked);
  };

  // 신고 핸들러 (사유 입력은 CommentItem에서 처리)
  const handleReport = (commentId: number, isReported: boolean, reason: string) => {
    toggleReportComment(commentId, isReported, reason);
  };

  // 트리 구조로 변환
  const commentTree = buildCommentTree(comments);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">댓글</h2>
      
      {/* 메인 댓글 작성 폼 */}
      {user && !replyingTo && (
        <div className="mt-4">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="댓글을 입력하세요"
          />
          <div className="mt-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              작성
            </button>
          </div>
        </div>
      )}

      {!user && (
        <p className="mt-2 text-sm text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
      )}

      <div className="mt-6 space-y-6">
        {commentTree.map(comment => (
          <div
            key={comment.id}
            className="space-y-4"
            id={`comment-${comment.id}`}
            ref={el => { commentRefs.current[comment.id] = el; }}
          >
            <CommentItem 
              comment={comment}
              onReply={handleReply}
              showReplyButton={true}
              user={user}
              onLike={handleLike}
              onReport={handleReport}
            />
            {user && replyingTo === comment.id && (
              <div className="ml-8 mt-2">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="답글을 입력하세요"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    작성
                  </button>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
