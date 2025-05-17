'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import CategorySidebar from '@/components/molecules/category-sidebar';
import AuthModal from '@/components/molecules/auth-modal';
import type { Category, Post } from '@/types/board';

interface BoardClientProps {
  category: Category;
  subcategories: Category[];
  posts: Post[];
  pathname: string;
}

export default function BoardClient({ category, subcategories, posts, pathname }: BoardClientProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  const handleWriteClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategorySidebar mainCategory={category} subcategories={subcategories} pathname={pathname} />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{subcategories[0].name}</h1>
              <Link
                href={isLoggedIn ? `/board/${category.slug}/write` : '#'}
                onClick={handleWriteClick}
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                글쓰기
              </Link>
            </div>
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
            />
            {posts && posts.length > 0 ? (
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