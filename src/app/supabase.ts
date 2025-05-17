// types/supabase.ts
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
  username: string;
  avatar_url?: string;
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

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          slug: string;
          parent_id: number | null;
          requires_auth: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          slug: string;
          parent_id?: number | null;
          requires_auth?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          slug?: string;
          parent_id?: number | null;
          requires_auth?: boolean;
        };
      };
      posts: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          title: string;
          content: string;
          user_id: string;
          category_id: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title: string;
          content: string;
          user_id: string;
          category_id: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title?: string;
          content?: string;
          user_id?: string;
          category_id?: number;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          display_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      school_verifications: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          school_id: number;
          verified_at: string | null;
          verification_method: string;
          status: string;
          email: string;
          verification_code: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          school_id: number;
          verified_at?: string | null;
          verification_method: string;
          status?: string;
          email: string;
          verification_code?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          school_id?: number;
          verified_at?: string | null;
          verification_method?: string;
          status?: string;
          email?: string;
          verification_code?: string | null;
        };
      };
      school_email_domains: {
        Row: {
          id: number;
          created_at: string;
          school_id: number;
          domain: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          school_id: number;
          domain: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          school_id?: number;
          domain?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
