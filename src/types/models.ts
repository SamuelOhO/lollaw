export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  requires_auth: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: string;
  category_id: number;
  created_at: string;
  updated_at: string;
  views: number;
  profiles?: {
    display_name: string | null;
    avatar_url?: string | null;
    user_type?: string | null;
  };
}

export interface Comment {
  id: number;
  content: string;
  user_id: string;
  post_id: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  user_type?: string | null;
  created_at: string;
}

// 학교 인증 관련 타입 정의
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface SchoolVerification {
  id: string;
  user_id: string;
  school_id: number;
  verified_at: string;
  verification_method: string;
  status: VerificationStatus;
  email: string;
}

export interface SchoolEmailDomain {
  id: number;
  school_id: number;
  domain: string;
  created_at: string;
}
