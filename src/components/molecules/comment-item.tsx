'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Comment } from '@/types/board';
import Image from 'next/image';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number) => void;
  level?: number;
}

export default function CommentItem({ comment, onReply, level = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleCancel = () => {
    setIsReplying(false);
    setReplyContent('');
  };

  const handleSubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id);
      setIsReplying(false);
      setReplyContent('');
    }
  };

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
              {format(new Date(comment.created_at || new Date()), 'PPP', { locale: ko })}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
          <div className="mt-2">
            <button onClick={handleReply} className="text-sm text-blue-600 hover:text-blue-800">
              답글
            </button>
          </div>
          {isReplying && (
            <div className="mt-2">
              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="답글을 입력하세요"
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  작성
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
