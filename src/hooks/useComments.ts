import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Comment } from '@/types/comment';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // 좋아요/신고 정보 fetch
  const fetchMeta = async (commentIds: number[], userId: string | null) => {
    const { data: likesData } = await supabase
      .from('likes_comments')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);
    const { data: reportsData } = await supabase
      .from('reports_comments')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);
    return { likesData: likesData || [], reportsData: reportsData || [] };
  };

  // fetchComments를 외부로 분리
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
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
        const allComments: Comment[] = [];
        const commentIds = commentsData.map(c => c.id);
        const { likesData, reportsData } = await fetchMeta(commentIds, user?.id ?? null);

        commentsData.forEach(comment => {
          const profile = profilesMap.get(comment.user_id);
          const likesForComment = likesData.filter(l => l.comment_id === comment.id);
          const reportsForComment = reportsData.filter(r => r.comment_id === comment.id);
          const formattedComment: Comment = {
            ...comment,
            profiles: {
              display_name: profile?.display_name ?? null,
              avatar_url: profile?.avatar_url ?? null,
            },
            replies: [],
            likesCount: likesForComment.length,
            isLiked: !!user && likesForComment.some(l => l.user_id === user.id),
            reportCount: reportsForComment.length,
            isReported: !!user && reportsForComment.some(r => r.user_id === user.id),
          };
          commentMap.set(formattedComment.id, formattedComment);
          allComments.push(formattedComment);
        });
        setComments(allComments);
      }
    } catch (error) {
      console.error('댓글 로딩 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
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
  }, [postId, user, fetchComments]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // 댓글 좋아요 토글
  const toggleLikeComment = async (commentId: number, isLiked: boolean) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            likesCount: isLiked ? (comment.likesCount ?? 0) - 1 : (comment.likesCount ?? 0) + 1,
            isLiked: !isLiked,
          }
        : comment
    ));
    try {
      if (isLiked) {
        await supabase.from('likes_comments').delete().eq('comment_id', commentId).eq('user_id', user.id);
      } else {
        await supabase.from('likes_comments').insert([{ comment_id: commentId, user_id: user.id }]);
      }
      await fetchComments();
    } catch (error) {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              likesCount: isLiked ? (comment.likesCount ?? 0) + 1 : (comment.likesCount ?? 0) - 1,
              isLiked: isLiked,
            }
          : comment
      ));
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 신고 토글
  const toggleReportComment = async (commentId: number, isReported: boolean, reason: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            reportCount: isReported ? (comment.reportCount ?? 0) - 1 : (comment.reportCount ?? 0) + 1,
            isReported: !isReported,
          }
        : comment
    ));
    try {
      if (isReported) {
        await supabase.from('reports_comments').delete().eq('comment_id', commentId).eq('user_id', user.id);
      } else {
        await supabase.from('reports_comments').insert([{ comment_id: commentId, user_id: user.id, reason }]);
      }
      await fetchComments();
    } catch (error) {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              reportCount: isReported ? (comment.reportCount ?? 0) + 1 : (comment.reportCount ?? 0) - 1,
              isReported: isReported,
            }
          : comment
      ));
      toast.error('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentId: number | null = null) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return null;
    }
    if (!content.trim() || isLoading) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('comments').insert([
        {
          content: content.trim(),
          post_id: postId,
          user_id: user.id,
          parent_id: parentId,
        },
      ]).select().single();

      if (error) throw error;

      await fetchComments();
      return data;
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
      toast.error('댓글 작성 중 오류가 발생했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    user,
    isLoading,
    addComment,
    toggleLikeComment,
    toggleReportComment,
  };
}
