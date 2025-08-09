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
          requires_auth: boolean | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          slug: string;
          parent_id?: number | null;
          requires_auth?: boolean | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          slug?: string;
          parent_id?: number | null;
          requires_auth?: boolean | null;
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
          report_count: number;
          is_hidden: boolean;
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
          report_count?: number;
          is_hidden?: boolean;
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
          report_count?: number;
          is_hidden?: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          nickname_last_updated: string | null;
          school_verified: boolean | null;
          school_email: string | null;
          school_document_url: string | null;
          school_generation: number | null;
          lawyer_verified: boolean | null;
          user_type: string | null;
          is_anonymous: boolean | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          nickname_last_updated?: string | null;
          school_verified?: boolean | null;
          school_email?: string | null;
          school_document_url?: string | null;
          school_generation?: number | null;
          lawyer_verified?: boolean | null;
          user_type?: string | null;
          is_anonymous?: boolean | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          nickname_last_updated?: string | null;
          school_verified?: boolean | null;
          school_email?: string | null;
          school_document_url?: string | null;
          school_generation?: number | null;
          lawyer_verified?: boolean | null;
          user_type?: string | null;
          is_anonymous?: boolean | null;
        };
      };
      comments: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          content: string;
          user_id: string;
          post_id: number;
          parent_id: number | null;
          report_count: number;
          is_hidden: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          content: string;
          user_id: string;
          post_id: number;
          parent_id?: number | null;
          report_count?: number;
          is_hidden?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          content?: string;
          user_id?: string;
          post_id?: number;
          parent_id?: number | null;
          report_count?: number;
          is_hidden?: boolean;
        };
      };
      likes: {
        Row: {
          id: number;
          created_at: string;
          user_id: string | null;
          post_id: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          post_id?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string | null;
          post_id?: number | null;
        };
      };
      likes_comments: {
        Row: {
          id: number;
          comment_id: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          comment_id: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          comment_id?: number;
          user_id?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          target_type: 'post' | 'comment';
          target_id: number;
          user_id: string | null;
          reason: string;
          status: string | null;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          target_type: 'post' | 'comment';
          target_id: number;
          user_id?: string | null;
          reason: string;
          status?: string | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          target_type?: 'post' | 'comment';
          target_id?: number;
          user_id?: string | null;
          reason?: string;
          status?: string | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      school_verifications: {
        Row: {
          id: string;
          created_at: string | null;
          user_id: string | null;
          school_id: number | null;
          verified_at: string | null;
          verification_method: string | null;
          status: string | null;
          email: string | null;
          verification_code: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          user_id?: string | null;
          school_id?: number | null;
          verified_at?: string | null;
          verification_method?: string | null;
          status?: string | null;
          email?: string | null;
          verification_code?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          user_id?: string | null;
          school_id?: number | null;
          verified_at?: string | null;
          verification_method?: string | null;
          status?: string | null;
          email?: string | null;
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
      increment_post_views: {
        Args: {
          post_id: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      report_target_type: 'post' | 'comment';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
