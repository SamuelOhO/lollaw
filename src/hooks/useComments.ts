import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Comment } from '@/types/board';
import type { User } from '@supabase/supabase-js';

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchComments = async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('댓글 로딩 중 오류:', commentsError);
        return;
      }

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('프로필 로딩 중 오류:', profilesError);
          return;
        }

        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        commentsData.forEach(comment => {
          const profile = profilesMap.get(comment.user_id);
          const formattedComment: Comment = {
            ...comment,
            profiles: {
              display_name: profile?.display_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
            },
            replies: [],
          };
          commentMap.set(formattedComment.id, formattedComment);

          if (comment.parent_id === null) {
            rootComments.push(formattedComment);
          } else {
            const parentComment = commentMap.get(comment.parent_id);
            if (parentComment) {
              parentComment.replies = parentComment.replies || [];
              parentComment.replies.push(formattedComment);
            }
          }
        });

        setComments(rootComments);
      }
    };

    fetchComments();

    const channel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const addComment = async (content: string, parentId: number | null = null) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase.from('comments').insert([
        {
          content: content.trim(),
          post_id: postId,
          user_id: user.id,
          parent_id: parentId,
        },
      ]);

      if (error) throw error;

      // 댓글 작성 후 즉시 새로고침
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('댓글 로딩 중 오류:', commentsError);
        return;
      }

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('프로필 로딩 중 오류:', profilesError);
          return;
        }

        const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        commentsData.forEach(comment => {
          const profile = profilesMap.get(comment.user_id);
          const formattedComment: Comment = {
            ...comment,
            profiles: {
              display_name: profile?.display_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
            },
            replies: [],
          };
          commentMap.set(formattedComment.id, formattedComment);

          if (comment.parent_id === null) {
            rootComments.push(formattedComment);
          } else {
            const parentComment = commentMap.get(comment.parent_id);
            if (parentComment) {
              parentComment.replies = parentComment.replies || [];
              parentComment.replies.push(formattedComment);
            }
          }
        });

        setComments(rootComments);
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
    }
  };

  return {
    comments,
    user,
    addComment,
  };
}
