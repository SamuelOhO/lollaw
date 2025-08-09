// 기본 데이터베이스 타입 재내보내기
export type { Database } from './database.types';
export type { ApiResponse, ApiError, PaginationParams, PaginatedResponse, QueryKey } from './api';

// 데이터베이스 테이블 타입 추출
import type { Database } from './database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Like = Database['public']['Tables']['likes']['Row'];
export type LikeInsert = Database['public']['Tables']['likes']['Insert'];
export type LikeUpdate = Database['public']['Tables']['likes']['Update'];

export type SchoolVerification = Database['public']['Tables']['school_verifications']['Row'];
export type SchoolVerificationInsert = Database['public']['Tables']['school_verifications']['Insert'];
export type SchoolVerificationUpdate = Database['public']['Tables']['school_verifications']['Update'];

export type SchoolEmailDomain = Database['public']['Tables']['school_email_domains']['Row'];
export type SchoolEmailDomainInsert = Database['public']['Tables']['school_email_domains']['Insert'];
export type SchoolEmailDomainUpdate = Database['public']['Tables']['school_email_domains']['Update'];

// 확장된 타입들 (조인 데이터 포함)
export interface PostWithProfile extends Post {
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    user_type: string | null;
  } | null;
  comments?: {
    count: number;
  };
  likes?: {
    count: number;
  };
  comments_count?: number;
  likes_count?: number;
  is_liked?: boolean;
}

export interface CommentWithProfile extends Comment {
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  replies?: CommentWithProfile[];
  likes_count?: number;
  is_liked?: boolean;
  is_reported?: boolean;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
  parent?: Category | null;
}

// 폼 데이터 타입
export interface PostFormData {
  title: string;
  content: string;
  category_id: number;
}

export interface CommentFormData {
  content: string;
  post_id: number;
  parent_id?: number | null;
}

export interface ProfileFormData {
  display_name: string;
  avatar_url?: string;
}

// 인증 관련 타입
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile | null;
  school_verification?: SchoolVerification | null;
}

// 검색 및 필터 타입
export interface PostFilters {
  category_id?: number;
  search?: string;
  user_id?: string;
  sort_by?: 'created_at' | 'views' | 'likes_count';
  sort_order?: 'asc' | 'desc';
}

export interface CommentFilters {
  post_id: number;
  parent_id?: number | null;
}

// 리포트 관련 타입 (기존 report.ts에서 가져오기)
export interface CreateReportDto {
  target_type: 'post' | 'comment';
  target_id: number;
  reason: string;
  user_id: string;
}

export interface Report {
  id: number;
  target_type: 'post' | 'comment';
  target_id: number;
  reason: string;
  user_id: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
} 