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