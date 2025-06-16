export interface Comment {
  id: number;
  content: string;
  user_id: string;
  post_id: number;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
  report_count: number;
  is_hidden: boolean;
  display_name: string | null;
  avatar_url: string | null;
  replies?: Comment[];
  likes_count?: number;
  isLiked?: boolean;
  isReported?: boolean;
}

export interface CommentFormData {
  content: string;
  post_id: number;
  parent_id?: number;
} 