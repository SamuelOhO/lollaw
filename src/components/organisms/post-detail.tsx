'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePost } from '@/hooks/usePost';
import { logError } from '@/utils/error-handler';
import { createClient } from '@/utils/supabase/client';
import ReportModal from '@/components/molecules/report-modal';

interface PostDetailProps {
  postId: string;
  slug: string;
}

const PostDetail = memo(function PostDetail({ postId, slug }: PostDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    post, 
    isLoading, 
    isError, 
    error, 
    toggleLike, 
    isLiked,
    likesCount 
  } = usePost(parseInt(postId));
  
  const [showReportModal, setShowReportModal] = useState(false);
  const supabase = createClient();

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      toggleLike();
    } catch (error) {
      logError(error, 'Post like toggle error');
    }
  }, [isAuthenticated, toggleLike]);

  const handleDelete = useCallback(async () => {
    if (!user || !post || post.user_id !== user.id) {
      toast.error('삭제 권한이 없습니다.');
      return;
    }

    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('게시글이 삭제되었습니다.');
      router.push(`/board/${slug}`);
    } catch (error) {
      logError(error, 'Post delete error');
    }
  }, [user, post, postId, slug, router, supabase]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="mb-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            {error?.message || '게시글을 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => router.push(`/board/${slug}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && post.user_id === user.id;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              작성자: {post.profiles?.display_name || '알 수 없음'} |{' '}
              {format(new Date(post.created_at), 'PPP', { locale: ko })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 ${
                isLiked
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span>👍</span>
              <span>{likesCount}</span>
            </button>
            {isAuthor ? (
              <>
                <button
                  onClick={() => router.push(`/board/${slug}/edit/${postId}`)}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowReportModal(true)}
                className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                신고
              </button>
            )}
          </div>
        </div>
        <div className="prose max-w-none dark:prose-invert">
          {post.content}
        </div>
      </div>

      <ReportModal
        targetId={postId}
        targetType="post"
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
});

export default PostDetail;