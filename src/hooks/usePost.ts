import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Post } from '@/types/board';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      // 조회수 증가를 먼저 수행
      await supabase.rpc('increment_views', { post_id: parseInt(postId) });

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          title,
          content,
          created_at,
          updated_at,
          views,
          user_id,
          category_id,
          profiles (
            display_name,
            avatar_url
          ),
          comments:comments(count),
          likes:likes(count)
        `
        )
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      if (data) {
        const formattedPost = {
          ...data,
          profiles: {
            display_name: data.profiles?.[0]?.display_name ?? null,
            avatar_url: data.profiles?.[0]?.avatar_url ?? null,
          },
          likes: { count: data.likes[0]?.count ?? 0 },
          comments: { count: data.comments[0]?.count ?? 0 },
        } as Post;

        setPost(formattedPost);
        setLikesCount(data.likes[0]?.count ?? 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : '게시글을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    if (!user) {
      setIsLiked(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', parseInt(postId))
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('좋아요 상태 확인 중 오류:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (err) {
      console.error('좋아요 상태 확인 중 오류:', err);
    }
  };

  const toggleLike = async (user: any) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    try {
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', parseInt(postId))
          .eq('user_id', user.id);
        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        delete likedPosts[postId];
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      } else {
        const { error } = await supabase.from('likes').insert([
          {
            post_id: parseInt(postId),
            user_id: user.id,
          },
        ]);
        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        likedPosts[postId] = true;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchPost();

    // 실시간 업데이트 구독
    const channel = supabase
      .channel('post_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        () => {
          fetchPost();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId]);

  return {
    post,
    isLiked,
    likesCount,
    loading,
    error,
    checkLikeStatus,
    toggleLike,
  };
}
