'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import type { Post } from '@/types/board';

export default function DefaultContent({ categoryId }: { categoryId: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const supabase = createClient();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          views,
          user_id,
          category_id,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          comments:comments(count),
          likes:likes(count)
        `)
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        const formattedPosts = data.map(post => ({
          ...post,
          profiles: {
            display_name: post.profiles?.[0]?.display_name ?? null,
            avatar_url: post.profiles?.[0]?.avatar_url ?? null
          },
          comments: {
            count: post.comments?.[0]?.count ?? 0
          },
          likes: {
            count: post.likes?.[0]?.count ?? 0
          }
        }));
        setPosts(formattedPosts as Post[]);
      }
    }

    fetchPosts();

    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `category_id=eq.${categoryId}`
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [categoryId]);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/board/${slug}/${post.id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {post.title}
                {post.comments.count > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    [{post.comments.count}]
                  </span>
                )}
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{post.profiles.display_name || '익명'}</span>
                <span className="mx-2">•</span>
                <span>
                  {format(new Date(post.created_at || new Date()), 'yyyy.MM.dd HH:mm', {
                    locale: ko,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>조회 {post.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>좋아요 {post.likes.count}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 