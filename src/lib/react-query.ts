import { QueryClient } from '@tanstack/react-query';
import { showError } from '@/utils/error-handler';

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 설정
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
      retry: (failureCount, error: any) => {
        // 인증 에러나 404는 재시도하지 않음
        if (error?.status === 401 || error?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      onError: (error) => {
        showError(error, '작업 중 오류가 발생했습니다.');
      },
    },
  },
});

// 쿼리 무효화 헬퍼
export const invalidateQueries = {
  // 사용자 관련
  user: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  userProfile: (id: string) => queryClient.invalidateQueries({ queryKey: ['user', 'profile', id] }),
  
  // 게시글 관련
  posts: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  post: (id: number) => queryClient.invalidateQueries({ queryKey: ['posts', id] }),
  postsByCategory: (categoryId: number) => queryClient.invalidateQueries({ queryKey: ['posts', 'category', categoryId] }),
  
  // 댓글 관련
  comments: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  commentsByPost: (postId: number) => queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] }),
  
  // 카테고리 관련
  categories: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  category: (slug: string) => queryClient.invalidateQueries({ queryKey: ['categories', slug] }),
  
  // 인증 관련
  auth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  schoolVerification: (userId: string) => queryClient.invalidateQueries({ queryKey: ['auth', 'school-verification', userId] }),
};

// 프리페치 헬퍼
export const prefetchQueries = {
  // 주요 페이지 데이터 프리페치
  mainPage: async () => {
    // 메인 페이지에서 필요한 데이터들을 미리 로드
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        staleTime: 10 * 60 * 1000, // 10분
      }),
      queryClient.prefetchQuery({
        queryKey: ['posts', 'category', 1], // 자유게시판
        staleTime: 2 * 60 * 1000, // 2분
      }),
    ]);
  },
}; 