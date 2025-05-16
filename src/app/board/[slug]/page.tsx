'use client';

import CategorySidebar from '@/components/molecules/category-sidebar';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCategory } from '@/hooks/useCategory';
import { usePosts } from '@/hooks/usePosts';


export default function BoardPage({ params: { slug } }: { params: { slug: string } }) {
  const {
    category,
    subcategories,
    loading: categoryLoading,
    error: categoryError,
  } = useCategory(slug);
  const { posts, loading: postsLoading, session } = usePosts(category?.id ?? null);
  const loading = categoryLoading || postsLoading;
  const error = categoryError;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!category || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategorySidebar mainCategory={category} subcategories={subcategories} />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
              <Link
                href={`/board/${category.slug}/write`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
              >
                글쓰기
              </Link>
            </div>
            {posts.length > 0 ? (
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
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  조회 {post.views}
                                </p>
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
                                  {format(new Date(post.created_at || new Date()), 'PPP', {
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
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">아직 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
