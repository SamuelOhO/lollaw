'use client';

import { Comment } from '@/types';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onReply: (parentId: number, content: string) => void;
  onLike: (commentId: number) => void;
  onReport: (commentId: number) => void;
  onReportCancel: (commentId: number) => void;
}

export default function CommentList({ 
  comments, 
  onUpdate, 
  onDelete, 
  onReply, 
  onLike, 
  onReport, 
  onReportCancel 
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onReply={onReply}
          onLike={onLike}
          onReport={onReport}
          onReportCancel={onReportCancel}
          isReply={false}
        />
      ))}
    </div>
  );
} 