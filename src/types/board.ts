import type { Database } from './database.types'

// 데이터베이스 테이블 타입
export type Tables = Database['public']['Tables']
export type CategoryRow = Tables['categories']['Row']
export type PostRow = Tables['posts']['Row']
export type ProfileRow = Tables['profiles']['Row']
export type CommentRow = Tables['comments']['Row']
export type LikeRow = Tables['likes']['Row']

// 좋아요 타입
export interface Like extends LikeRow {
  profiles?: {
    display_name: string | null
    avatar_url: string | null
  }
}

// 확장된 Comment 타입
export interface Comment extends Omit<CommentRow, 'profiles'> {
  profiles: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
  replies?: Comment[]
}

// 카테고리 타입
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  requires_auth: boolean | null;
  created_at: string | null;
  parent?: Category | null;
  children?: Category[];
}

// 확장된 카테고리 타입 (UI 표시용)
export interface ExtendedCategory extends Category {
  parent?: Category | null;
  children?: Category[];
}

// 게시글 타입
export interface Post extends Omit<PostRow, 'profiles'> {
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
  comments: {
    count: number;
  };
  likes: {
    count: number;
  };
  category?: {
    name: string;
    slug: string;
  };
}

// 게시판 페이지 props
export interface BoardPageProps {
  params: { 
    slug: string 
  }
  searchParams: { 
    page?: string
    limit?: string 
  }
}

export interface BoardPageContentProps {
  category: Category
  posts: Post[]
  page: number
  limit: number
} 