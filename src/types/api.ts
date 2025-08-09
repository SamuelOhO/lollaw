// API 응답 표준 타입
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// API 에러 타입
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 쿼리 키 타입
export const QueryKeys = {
  // 사용자 관련
  user: ['user'] as const,
  userProfile: (id: string) => ['user', 'profile', id] as const,
  
  // 게시글 관련
  posts: ['posts'] as const,
  post: (id: number) => ['posts', id] as const,
  postsByCategory: (categoryId: number) => ['posts', 'category', categoryId] as const,
  
  // 댓글 관련
  comments: ['comments'] as const,
  commentsByPost: (postId: number) => ['comments', 'post', postId] as const,
  
  // 카테고리 관련
  categories: ['categories'] as const,
  category: (slug: string) => ['categories', slug] as const,
  
  // 인증 관련
  auth: ['auth'] as const,
  schoolVerification: (userId: string) => ['auth', 'school-verification', userId] as const,
} as const;

export type QueryKey = typeof QueryKeys[keyof typeof QueryKeys]; 