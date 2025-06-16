'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Comment, CommentFormData } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

// 댓글들을 계층구조로 변환하는 함수
const organizeComments = (comments: Comment[]): Comment[] => {
  const commentsMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // 모든 댓글을 맵에 저장하고 replies 배열 초기화
  comments.forEach(comment => {
    commentsMap.set(comment.id, { ...comment, replies: [] });
  });

  // parent_id에 따라 댓글들을 분류
  comments.forEach(comment => {
    const commentWithReplies = commentsMap.get(comment.id)!;
    
    if (comment.parent_id) {
      // 대댓글인 경우
      const parentComment = commentsMap.get(comment.parent_id);
      if (parentComment) {
        parentComment.replies!.push(commentWithReplies);
      }
    } else {
      // 루트 댓글인 경우
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

export const useComments = (postId: number, initialComments?: Comment[]) => {
  const [comments, setComments] = useState<Comment[]>(initialComments ? organizeComments(initialComments) : []);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchComments = async () => {
    if (initialComments) return;
    
    try {
      setLoading(true);
      
      // comments 기본 데이터 가져오기
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('댓글 조회 중 오류:', commentsError);
        setError(commentsError.message);
        return;
      }

      console.log('Raw comments data:', commentsData);

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // 현재 사용자의 모든 신고 상태를 한 번에 조회
      let userReportsMap = new Map<number, boolean>();
      if (user) {
        const commentIds = commentsData.map(c => c.id);
        const { data: userReports, error: reportsError } = await supabase
          .from('reports')
          .select('target_id')
          .eq('target_type', 'comment')
          .in('target_id', commentIds)
          .eq('user_id', user.id);

        if (!reportsError && userReports) {
          userReports.forEach(report => {
            userReportsMap.set(report.target_id, true);
          });
        } else if (reportsError) {
          console.error('신고 상태 조회 오류:', reportsError);
        }
      }

      // 현재 사용자의 모든 좋아요 상태를 한 번에 조회
      let userLikesMap = new Map<number, boolean>();
      let likesCountMap = new Map<number, number>();
      
      if (user) {
        const commentIds = commentsData.map(c => c.id);
        const { data: userLikes, error: likesError } = await supabase
          .from('likes_comments')
          .select('comment_id')
          .in('comment_id', commentIds)
          .eq('user_id', user.id);

        if (!likesError && userLikes) {
          userLikes.forEach(like => {
            userLikesMap.set(like.comment_id, true);
          });
        }
      }

      // 각 댓글의 좋아요 개수 조회
      for (const comment of commentsData) {
        const { count, error: countError } = await supabase
          .from('likes_comments')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);
        
        if (!countError) {
          likesCountMap.set(comment.id, count || 0);
        }
      }

      // 각 댓글에 대해 프로필 정보와 상태 추가
      const commentsWithProfiles = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', comment.user_id)
            .single();

          const finalComment: any = {
            ...comment,
            display_name: profileData?.display_name || null,
            avatar_url: profileData?.avatar_url || null,
            likes_count: likesCountMap.get(comment.id) || 0,
            isLiked: userLikesMap.get(comment.id) || false,
            isReported: userReportsMap.get(comment.id) || false,
          };

          console.log(`최종 처리된 댓글 ${comment.id}:`, {
            id: comment.id,
            report_count: comment.report_count,
            isReported: finalComment.isReported,
            likes_count: finalComment.likes_count,
            isLiked: finalComment.isLiked
          });

          return finalComment;
        })
      );

      // 댓글들을 계층구조로 변환
      const organizedComments = organizeComments(commentsWithProfiles);
      console.log('최종 구성된 댓글들:', organizedComments);
      setComments(organizedComments);
    } catch (err) {
      console.error('댓글 조회 중 오류:', err);
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData: CommentFormData) => {
    if (!user) {
      toast.error('댓글을 작성하려면 로그인이 필요합니다.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            ...commentData,
            post_id: postId,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('댓글 작성 중 오류:', error);
        toast.error('댓글 작성에 실패했습니다.');
        return null;
      }

      // 새 댓글에 프로필 정보 추가
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const newCommentWithProfile = {
        ...data,
        display_name: profileData?.display_name || null,
        avatar_url: profileData?.avatar_url || null,
        replies: [],
      } as any;

      setComments((prev) => {
        if (commentData.parent_id) {
          // 대댓글인 경우 - 부모 댓글의 replies에 추가
          return prev.map(comment => {
            if (comment.id === commentData.parent_id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentWithProfile]
              };
            }
            return comment;
          });
        } else {
          // 루트 댓글인 경우
          return [...prev, newCommentWithProfile];
        }
      });
      
      toast.success('댓글이 작성되었습니다.');
      return newCommentWithProfile.id; // 새로 생성된 댓글 ID 반환
    } catch (err) {
      console.error('댓글 작성 중 오류:', err);
      toast.error('댓글 작성에 실패했습니다.');
      return null;
    }
  };

  const updateComment = async (commentId: number, content: string) => {
    if (!user) {
      toast.error('댓글을 수정하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('댓글 수정 중 오류:', error);
        toast.error('댓글 수정에 실패했습니다.');
        return;
      }

      // 프로필 정보와 함께 댓글 업데이트
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const updatedCommentWithProfile = {
        ...data,
        display_name: profileData?.display_name || null,
        avatar_url: profileData?.avatar_url || null,
      } as Comment;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return { ...updatedCommentWithProfile, replies: comment.replies };
          }
          // 대댓글 검색
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply => 
              reply.id === commentId ? { ...updatedCommentWithProfile, replies: [] } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
      
      toast.success('댓글이 수정되었습니다.');
    } catch (err) {
      console.error('댓글 수정 중 오류:', err);
      toast.error('댓글 수정에 실패했습니다.');
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!user) {
      toast.error('댓글을 삭제하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('댓글 삭제 중 오류:', error);
        toast.error('댓글 삭제에 실패했습니다.');
        return;
      }

      setComments((prev) =>
        prev
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.filter(reply => reply.id !== commentId) || []
          }))
      );
      toast.success('댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('댓글 삭제 중 오류:', err);
      toast.error('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 좋아요/좋아요 취소
  const toggleCommentLike = async (commentId: number) => {
    if (!user) {
      toast.error('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || '좋아요 처리에 실패했습니다.');
        return;
      }

      // 댓글 상태 업데이트
      const updateCommentInList = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            const updatedComment = {
              ...comment,
              likes_count: (comment.likes_count || 0) + (result.isLiked ? 1 : -1),
              isLiked: result.isLiked
            } as Comment;
            console.log(`댓글 ${commentId} 좋아요 상태 업데이트:`, {
              이전: { likes_count: comment.likes_count, isLiked: comment.isLiked },
              이후: { likes_count: updatedComment.likes_count, isLiked: updatedComment.isLiked }
            });
            return updatedComment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentInList(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(prev => updateCommentInList(prev));
      toast.success(result.message);
    } catch (error) {
      console.error('댓글 좋아요 처리 중 오류:', error);
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 신고
  const reportComment = async (commentId: number, reason: string) => {
    if (!user) {
      toast.error('신고하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || '신고 처리에 실패했습니다.');
        return;
      }

      // 댓글 상태 업데이트
      const updateCommentInList = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              report_count: (comment.report_count || 0) + 1,
              isReported: true
            } as Comment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentInList(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(prev => updateCommentInList(prev));
      toast.success(result.message);
    } catch (error) {
      console.error('댓글 신고 처리 중 오류:', error);
      toast.error('신고 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 신고 취소
  const cancelCommentReport = async (commentId: number) => {
    if (!user) {
      toast.error('신고 취소하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || '신고 취소에 실패했습니다.');
        return;
      }

      // 댓글 상태 업데이트
      const updateCommentInList = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              report_count: Math.max((comment.report_count || 0) - 1, 0),
              isReported: false
            } as Comment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentInList(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(prev => updateCommentInList(prev));
      toast.success(result.message);
    } catch (error) {
      console.error('댓글 신고 취소 중 오류:', error);
      toast.error('신고 취소 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    reportComment,
    cancelCommentReport,
    refetchComments: fetchComments,
  };
};
