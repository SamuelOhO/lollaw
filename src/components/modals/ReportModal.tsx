import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ReportModalProps {
  targetId: number;
  targetType: 'post' | 'comment';
  onClose: () => void;
  onSubmit?: (reason: string) => Promise<void>;
}

export const ReportModal = ({ targetId, targetType, onClose, onSubmit }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('신고하려면 로그인이 필요합니다.');
      return;
    }

    if (!reason.trim()) {
      toast.error('신고 사유를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      if (targetType === 'comment' && onSubmit) {
        await onSubmit(reason.trim());
        onClose();
        return;
      }

      const { error } = await supabase.from('reports').insert([
        {
          target_type: targetType,
          target_id: targetId,
          user_id: user.id,
          reason: reason.trim(),
        },
      ]);

      if (error) {
        console.error('신고 중 오류:', error);
        if (error.code === '23505') {
          toast.error('이미 신고한 게시물입니다.');
        } else {
          toast.error('신고 처리 중 오류가 발생했습니다.');
        }
        return;
      }

      toast.success('신고가 접수되었습니다.');
      onClose();
    } catch (err) {
      console.error('신고 중 오류:', err);
      toast.error('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {targetType === 'post' ? '게시글' : '댓글'} 신고
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              신고 사유
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="신고 사유를 입력해주세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600"
            >
              {submitting ? '처리 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 