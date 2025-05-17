// import { User } from './user';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: number;
  parent_id: number | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
  likesCount?: number;
  isLiked?: boolean;
  reportCount?: number;
  isReported?: boolean;
} 