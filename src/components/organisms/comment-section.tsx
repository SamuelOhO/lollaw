'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import CommentItem from '@/components/molecules/comment-item';

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { comments, user, addComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (newComment.trim()) {
      await addComment(newComment, replyingTo);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">댓글</h2>
      {user ? (
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
      ) : (
        <p className="mt-2 text-sm text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
      <div className="mt-6">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
        ))}
      </div>
    </div>
  );
}
