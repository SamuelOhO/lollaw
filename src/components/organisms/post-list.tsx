'use client';

import { usePosts } from '@/hooks/usePosts';
import PostItem from '@/components/molecules/post-item';

interface PostListProps {
  categoryId: number | null;
  requiresAuth: boolean;
  slug: string;
}

export default function PostList({ categoryId, requiresAuth, slug }: PostListProps) {
  const { posts, session, loading } = usePosts(categoryId);

  const handleWriteClick = () => {
    if (!session) {
      localStorage.setItem('previousPath', `/board/${slug}`);
      window.location.href = '/auth/login';
      return;
    }
    window.location.href = `/board/${slug}/write`;
  };

  if (loading) {
    return <div className="animate-pulse">게시글을 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">게시글 목록</h2>
        {(!requiresAuth || session) && (
          <button
            onClick={handleWriteClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            글쓰기
          </button>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {posts.map(post => (
              <PostItem key={post.id} post={post} slug={slug} />
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">아직 작성된 글이 없습니다.</p>
      )}
    </div>
  );
}
