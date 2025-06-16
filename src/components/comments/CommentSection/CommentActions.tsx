'use client';

interface CommentActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export default function CommentActions({ onEdit, onDelete }: CommentActionsProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onEdit}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        수정
      </button>
      <button
        onClick={onDelete}
        className="text-sm text-red-500 hover:text-red-600"
      >
        삭제
      </button>
    </div>
  )
} 