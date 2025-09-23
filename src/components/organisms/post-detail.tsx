'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePost';
import { useComments } from '@/hooks/useComments';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CommentSection from '@/components/comments/CommentSection';
import CategorySidebar from '@/components/molecules/category-sidebar';
import { useCategory } from '@/hooks/useCategory';
import { useAuth } from '@/hooks/useAuth';

interface PostDetailProps {
  postId: string;
}

export default function PostDetail({ postId }: PostDetailProps) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const {
    post,
    isLoading,
    error,
    toggleLike,
    isLiked,
    likesCount,
    isToggling,
    reportCount,
    isHidden
  } = usePost(parseInt(postId));

  const { category, subcategories } = useCategory(slug);

  const handleLike = async () => {
    if (!user) {
      // 로그인 필요 모달 표시 로직
      return;
    }
    await toggleLike();
  };

  if (isLoading) {
    return <div className="mx-auto max-w-4xl p-4">로딩 중...</div>;
  }

  if (error || !post) {
    return <div className="mx-auto max-w-4xl p-4">게시글을 불러올 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 왼쪽: 카테고리 사이드바 */}
      <aside className="hidden lg:block lg:col-span-1">
        {category && (
          <CategorySidebar
            mainCategory={category}
            subcategories={subcategories}
            pathname={`/board/${slug}/${postId}`}
          />
        )}
      </aside>

      <div className="lg:col-span-3 mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
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
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isToggling}
            >
              <span>👍</span>
              <span>{likesCount}</span>
            </button>
            {/* 신고 카운트 표시 */}
            {reportCount > 0 && (
              <div className="flex items-center gap-1 rounded-lg px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <span>🚨</span>
                <span>{reportCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* 보조 내비게이션: 목록으로, 이전/다음 자리 */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push(`/board/${slug}`)}
            className="rounded bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ← 목록으로
          </button>
        </div>

        <div className="prose max-w-none dark:prose-invert">
          {/* 신고 누적으로 숨김 처리된 경우 */}
          {isHidden ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">신고되어 안보이는 글입니다.</p>
              <p className="text-sm mt-2">신고가 누적되어 해당 게시글을 볼 수 없습니다.</p>
            </div>
          ) : (
            post.content
          )}
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="lg:col-span-3">
        <CommentSection postId={parseInt(postId)} />
      </div>
    </div>
  );
}