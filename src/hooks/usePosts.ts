import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { QueryKeys } from '@/types/api';
import type { PostWithProfile } from '@/types';
import { handleApiError } from '@/utils/error-handler';

const POSTS_PER_PAGE = 10;

interface PostsResponse {
  posts: PostWithProfile[];
  hasMore: boolean;
  nextCursor?: number;
}

interface UsePostsParams {
  categoryId: number | null;
  searchQuery?: string;
  sortBy?: 'created_at' | 'views' | 'likes_count';
  sortOrder?: 'asc' | 'desc';
}

export function usePosts({ 
  categoryId, 
  searchQuery, 
  sortBy = 'created_at', 
  sortOrder = 'desc' 
}: UsePostsParams) {
  const supabase = createClient();
  
  const fetchPosts = async ({ pageParam = 0 }): Promise<PostsResponse> => {
    if (categoryId === null) {
      return { posts: [], hasMore: false };
    }

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .eq('category_id', categoryId)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1);

      // 검색 쿼리가 있는 경우 필터링
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data: posts, error } = await query;

      if (error) throw error;

      const typedPosts = (posts || []) as PostWithProfile[];
      
      return {
        posts: typedPosts,
        hasMore: typedPosts.length === POSTS_PER_PAGE,
        nextCursor: pageParam + 1
      };
         } catch (error) {
       const apiError = handleApiError(error);
       toast.error('게시글을 불러오는데 실패했습니다.');
       throw error;
     }
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery({
    queryKey: [...QueryKeys.postsByCategory(categoryId || 0), searchQuery, sortBy, sortOrder],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: categoryId !== null,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });

  // 모든 페이지의 게시글을 평면화
  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return {
    posts,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    // 편의 메서드들
    isEmpty: !isLoading && posts.length === 0,
    totalPosts: posts.length
  };
}

// 게시글 좋아요 토글 훅
export function useTogglePostLike() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        
        if (error) throw error;
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: QueryKeys.posts });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error('좋아요 처리에 실패했습니다.');
    }
  });
}

// 게시글 조회수 증가 훅
export function useIncrementPostViews() {
  const supabase = createClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: postId
      });
      
      if (error) throw error;
    },
    onError: (error) => {
      // 조회수 증가 실패는 사용자에게 알리지 않음 (UX 방해 방지)
      console.error('조회수 증가 실패:', error);
    }
  });
}
