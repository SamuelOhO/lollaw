// import { User } from './user';

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
  report_count?: number;
  is_hidden?: boolean;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  user: {
    id: string;
    profiles: {
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
  replies?: Comment[];
  likes_count?: number;
  isLiked?: boolean;
  isReported?: boolean;
  // UI에서 사용되는 필드들
  display_name?: string | null;
  avatar_url?: string | null;
} 