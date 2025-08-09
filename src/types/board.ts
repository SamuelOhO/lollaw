// 하위 호환성을 위한 재내보내기
export type {
  Category,
  Post,
  Comment,
  Profile,
  PostWithProfile,
  CommentWithProfile,
  CategoryWithChildren,
  PostFormData,
  CommentFormData,
  PostFilters,
  CommentFilters,
} from './index';

import type { Category, PostWithProfile, CategoryWithChildren } from './index';

// 기존 코드와의 호환성을 위한 별칭
export type ExtendedCategory = CategoryWithChildren;

// 게시판 페이지 props
export interface BoardPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
  };
}

export interface BoardPageContentProps {
  category: Category;
  posts: PostWithProfile[];
  page: number;
  limit: number;
}
