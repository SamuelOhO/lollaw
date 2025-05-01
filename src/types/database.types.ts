export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          parent_id: number | null
          requires_auth: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          parent_id?: number | null
          requires_auth?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          parent_id?: number | null
          requires_auth?: boolean | null
          created_at?: string | null
        }
      }
      posts: {
        Row: {
          id: number
          title: string
          content: string
          user_id: string
          category_id: number
          created_at: string | null
          updated_at: string | null
          views: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
      }
      comments: {
        Row: {
          id: number
          content: string
          user_id: string
          post_id: number
          parent_id: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      likes: {
        Row: {
          id: number
          user_id: string | null
          post_id: number | null
          created_at: string | null
        }
      }
    }
  }
}

