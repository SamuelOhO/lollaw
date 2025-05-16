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
          views: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title: string;
          content: string;
          user_id: string;
          category_id: number;
          views?: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          title?: string;
          content?: string;
          user_id?: string;
          category_id?: number;
          views?: number;
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
      comments: {
        Row: {
          id: number;
          created_at: string;
          content: string;
          user_id: string;
          post_id: number;
          parent_id: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          content: string;
          user_id: string;
          post_id: number;
          parent_id?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          content?: string;
          user_id?: string;
          post_id?: number;
          parent_id?: number | null;
        };
      };
      likes: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          post_id: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          post_id: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          post_id?: number;
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
