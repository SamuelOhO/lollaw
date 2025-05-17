'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import CommentSection from '@/components/organisms/comment-section';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePost } from '@/hooks/usePost';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

export default function PostPage({ params }: { params: { slug: string; id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const { post, isLiked, likesCount, loading, error, checkLikeStatus, toggleLike } = usePost(
    params.id
  );

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        checkLikeStatus(user.id);
      }
    };

    checkUser();
  }, []);

  if (error) {
    router.push(`/board/${params.slug}`);
    return null;
  }

  if (loading || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    await toggleLike(user.id);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return format(new Date(date), 'yyyy년 M월 d일 HH:mm', { locale: ko });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/board/${params.slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          목록으로
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center justify-between mb-6 text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {post.profiles.avatar_url && (
                <Image
                  src={post.profiles.avatar_url}
                  alt="프로필"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span>{post.profiles.display_name || '익명'}</span>
            </div>
            <span>•</span>
            <time dateTime={post.created_at || ''}>{formatDate(post.created_at)}</time>
            {post.updated_at && post.updated_at !== post.created_at && (
              <>
                <span>•</span>
                <span className="text-gray-500">수정됨: {formatDate(post.updated_at)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">조회 {post.views || 0}</span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>

        <div className="prose max-w-none">{post.content}</div>
      </article>

      <CommentSection postId={parseInt(params.id)} />
    </div>
  );
}
