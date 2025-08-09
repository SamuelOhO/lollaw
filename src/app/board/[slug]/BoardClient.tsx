'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import CategorySidebar from '@/components/molecules/category-sidebar';
import AuthModal from '@/components/molecules/auth-modal';
import { usePosts } from '@/hooks/usePosts';
import { useCategory } from '@/hooks/useCategory';
import { useAuth } from '@/hooks/useAuth';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface BoardClientProps {
  slug: string;
  pathname: string;
}

const BoardClient = memo(function BoardClient({ slug, pathname }: BoardClientProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'views' | 'likes_count'>('created_at');
  const router = useRouter();
  
  // React Query 훅들 사용
  const { user, isAuthenticated } = useAuth();
  const { category, subcategories, isLoading: categoryLoading, isError: categoryError } = useCategory(slug);
  // category가 로딩 중이 아니고 존재할 때만 categoryId 설정
  const categoryId = !categoryLoading && category?.id ? category.id : null;
  
  const { 
    posts, 
    isLoading: postsLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isEmpty 
  } = usePosts({ 
    categoryId, 
    searchQuery, 
    sortBy 
  });

  // 무한 스크롤 구현
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  const handleWriteClick = useCallback((e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    setSearchQuery(query);
  }, []);

  // 로딩 상태
  if (categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (categoryError || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-500">카테고리를 불러오는데 실패했습니다.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategorySidebar mainCategory={category} subcategories={subcategories} pathname={pathname} />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <Link
                href={isAuthenticated ? `/board/${category.slug}/write` : '#'}
                onClick={handleWriteClick}
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                글쓰기
              </Link>
            </div>

            {/* 검색 및 정렬 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  name="search"
                  type="text"
                  placeholder="게시글 검색..."
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  defaultValue={searchQuery}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  검색
                </button>
              </form>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="created_at">최신순</option>
                <option value="views">조회순</option>
                <option value="likes_count">좋아요순</option>
              </select>
            </div>

            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
            />

            {/* 게시글 목록 */}
            {postsLoading && posts.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {posts.map(post => (
                    <li key={post.id}>
                      <Link href={`/board/${category.slug}/${post.id}`}>
                        <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-coral-600 truncate">
                                {post.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex gap-2">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  조회 {post.views}
                                </span>
                                {(post.likes_count || 0) > 0 && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    ❤️ {post.likes_count || 0}
                                  </span>
                                )}
                                {(post.comments_count || 0) > 0 && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    💬 {post.comments_count || 0}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {post.profiles?.display_name || '익명'}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  {format(new Date(post.created_at), 'PPP', {
                                    locale: ko,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* 무한 스크롤 로더 */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="p-4 text-center">
                    {isFetchingNextPage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    ) : (
                      <p className="text-gray-500">더 보기</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BoardClient;