import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { QueryKeys } from '@/types/api';
import type { PostWithProfile } from '@/types';
import { handleApiError } from '@/utils/error-handler';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

interface PostData extends PostWithProfile {
  likes_count: number;
  comments_count: number;
  user_is_liked: boolean;
}

export function usePost(postId: number) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 게시글 데이터 가져오기
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: QueryKeys.post(postId),
    queryFn: async (): Promise<PostData> => {
      try {
        // 기본 게시글 정보 가져오기
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            likes_count:likes(count),
            comments_count:comments(count)
          `)
          .eq('id', postId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('게시글을 찾을 수 없습니다.');
          }
          throw error;
        }

        // 프로필 정보를 별도로 가져오기
        let profileData: any = null;
        if (data.user_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', data.user_id)
            .single();

          if (!profileError && profile) {
            profileData = profile;
          }
        }

        // 로그인한 사용자인 경우 좋아요 여부 별도 확인
        let userIsLiked = false;
        if (user?.id) {
          const { data: likeData, error: likeError } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

          if (!likeError && likeData) {
            userIsLiked = true;
          }
        }

        // 타입 안전한 데이터 변환
        const postData: PostData = {
          ...data,
          profiles: profileData || { display_name: null, avatar_url: null },
          likes_count: data.likes_count?.[0]?.count || 0,
          comments_count: data.comments_count?.[0]?.count || 0,
          user_is_liked: userIsLiked
        };

        return postData;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });

  // 조회수 증가 (게시글 로드 시 한 번만 실행)
  const incrementViewsMutation = useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: postId
      });
      if (error) throw error;
    },
    onError: (error) => {
      // 조회수 증가 실패는 조용히 처리
      console.error('조회수 증가 실패:', error);
    }
  });

  // 좋아요 토글
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: QueryKeys.post(postId) });
      
      const previousPost = queryClient.getQueryData<PostData>(QueryKeys.post(postId));
      
      if (previousPost) {
        queryClient.setQueryData<PostData>(QueryKeys.post(postId), {
          ...previousPost,
          user_is_liked: !isLiked,
          likes_count: isLiked ? previousPost.likes_count - 1 : previousPost.likes_count + 1
        });
      }
      
      return { previousPost };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 이전 상태로 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(QueryKeys.post(variables.postId), context.previousPost);
      }
      
      const apiError = handleApiError(error);
      toast.error('좋아요 처리에 실패했습니다.');
    },
    onSettled: (data, error, variables) => {
      // 최종적으로 서버 데이터로 동기화
      queryClient.invalidateQueries({ queryKey: QueryKeys.post(variables.postId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.posts });
    }
  });

  // 실시간 업데이트 구독
  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`post_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QueryKeys.post(postId) });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QueryKeys.post(postId) });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: QueryKeys.post(postId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId, queryClient, supabase]);

  // 컴포넌트 마운트 시 조회수 증가
  useEffect(() => {
    if (postId && !incrementViewsMutation.isSuccess) {
      incrementViewsMutation.mutate(postId);
    }
  }, [postId]);

  const toggleLike = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!post) return;

    toggleLikeMutation.mutate({
      postId,
      isLiked: post.user_is_liked
    });
  };

  return {
    post,
    isLoading,
    isError,
    error,
    refetch,
    toggleLike,
    isToggling: toggleLikeMutation.isPending,
    // 편의 속성들
    isLiked: post?.user_is_liked || false,
    likesCount: post?.likes_count || 0,
    commentsCount: post?.comments_count || 0
  };
}
