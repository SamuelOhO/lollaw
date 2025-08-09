'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CommentWithProfile, CommentFormData } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { logError } from '@/utils/error-handler';

// 댓글들을 계층구조로 변환하는 함수
const organizeComments = (comments: CommentWithProfile[]): CommentWithProfile[] => {
  // 방어 코드: comments가 undefined이거나 배열이 아닌 경우 빈 배열 반환
  if (!Array.isArray(comments) || comments.length === 0) {
    return [];
  }

  const commentsMap = new Map<number, CommentWithProfile>();
  const rootComments: CommentWithProfile[] = [];

  // 모든 댓글을 맵에 저장하고 replies 배열 초기화
  comments.forEach(comment => {
    if (comment && typeof comment === 'object' && comment.id) {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    }
  });

  // parent_id에 따라 댓글들을 분류
  comments.forEach(comment => {
    if (!comment || !comment.id) return;
    
    const commentWithReplies = commentsMap.get(comment.id);
    if (!commentWithReplies) return;
    
    if (comment.parent_id) {
      // 대댓글인 경우
      const parentComment = commentsMap.get(comment.parent_id);
      if (parentComment && Array.isArray(parentComment.replies)) {
        parentComment.replies.push(commentWithReplies);
      }
    } else {
      // 루트 댓글인 경우
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

export const useComments = (postId: number, initialComments?: CommentWithProfile[]) => {
  const [comments, setComments] = useState<CommentWithProfile[]>(
    initialComments ? organizeComments(initialComments) : []
  );
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchComments = async () => {
    if (initialComments) return;
    
    // postId 유효성 검증
    if (!postId || isNaN(postId) || postId <= 0) {
      setError('유효하지 않은 게시글입니다.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 댓글 정보만 먼저 가져오기
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          likes_comments (
            id,
            user_id
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        logError(commentsError, 'Comments fetch error');
        setError(commentsError.message);
        return;
      }

      console.log('Raw comments data:', commentsData);

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // 프로필 정보를 별도로 가져오기
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        logError(profilesError, 'Profiles fetch error');
      }

      // 댓글과 프로필 정보 결합
      const enrichedComments = commentsData.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.id === comment.user_id) || {
          display_name: '알 수 없음',
          avatar_url: null
        }
      }));

      // 현재 사용자의 모든 신고 상태를 한 번에 조회
      let userReportsMap = new Map<number, boolean>();
      if (user) {
        const commentIds = enrichedComments.map(c => c.id);
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
          logError(reportsError, 'Reports fetch error');
        }
      }

      // 댓글 데이터 처리 - 이미 조인된 데이터 활용
      const commentsWithProfiles = enrichedComments
        .filter(comment => comment && typeof comment === 'object' && comment.id) // 유효한 댓글만 필터링
        .map((comment): CommentWithProfile => {
          // 좋아요 수 계산 (방어 코드 추가)
          const likesCount = Array.isArray(comment.likes_comments) ? comment.likes_comments.length : 0;
          
          // 현재 사용자의 좋아요 여부 확인 (방어 코드 추가)
          const isLiked = user && Array.isArray(comment.likes_comments) ? 
            comment.likes_comments.some((like: any) => like && like.user_id === user.id) : 
            false;

          const finalComment: CommentWithProfile = {
            ...comment,
            profiles: {
              display_name: comment.profiles?.display_name || null,
              avatar_url: comment.profiles?.avatar_url || null,
            },
            likes_count: likesCount,
            is_liked: isLiked,
            is_reported: userReportsMap.get(comment.id) || false,
            replies: [],
          };

          console.log(`최종 처리된 댓글 ${comment.id}:`, {
            id: comment.id,
            report_count: comment.report_count,
            is_reported: finalComment.is_reported,
            likes_count: finalComment.likes_count,
            is_liked: finalComment.is_liked
          });

          return finalComment;
        });

      // 댓글들을 계층구조로 변환
      const organizedComments = organizeComments(commentsWithProfiles);
      console.log('최종 구성된 댓글들:', organizedComments);
      setComments(organizedComments);
      
    } catch (error) {
      logError(error, 'Unexpected error in fetchComments');
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 추가
  const addComment = async (content: string, parentId?: number): Promise<number | null> => {
    if (!user) {
      toast.error('댓글을 작성하려면 로그인이 필요합니다.');
      return null;
    }

    if (!content.trim()) {
      toast.error('댓글 내용을 입력해주세요.');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: content.trim(),
            post_id: postId,
            user_id: user.id,
            parent_id: parentId || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // 새 댓글을 로컬 상태에 추가
        const newComment: CommentWithProfile = {
          ...data,
          profiles: {
            display_name: user.profile?.display_name || null,
            avatar_url: user.profile?.avatar_url || null,
          },
          likes_count: 0,
          is_liked: false,
          is_reported: false,
          replies: [],
        };

        if (parentId) {
          // 대댓글인 경우
          const updateCommentsWithReply = (comments: CommentWithProfile[]): CommentWithProfile[] => {
            return comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment]
                };
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateCommentsWithReply(comment.replies)
                };
              }
              return comment;
            });
          };

          setComments(prev => updateCommentsWithReply(prev));
        } else {
          // 루트 댓글인 경우
          setComments(prev => [...prev, newComment]);
        }

        toast.success('댓글이 작성되었습니다.');
        return data.id;
      }
    } catch (error) {
      logError(error, 'Comment add error');
      toast.error('댓글 작성 중 오류가 발생했습니다.');
    }

    return null;
  };

  // 댓글 수정
  const updateComment = async (commentId: number, content: string): Promise<void> => {
    if (!user) {
      toast.error('댓글을 수정하려면 로그인이 필요합니다.');
      return;
    }

    if (!content.trim()) {
      toast.error('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      const updateCommentInList = (comments: CommentWithProfile[]): CommentWithProfile[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content: content.trim() };
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
      toast.success('댓글이 수정되었습니다.');
    } catch (error) {
      logError(error, 'Comment update error');
      toast.error('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  // 댓글 삭제
  const deleteComment = async (commentId: number): Promise<void> => {
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
        throw error;
      }

      // 로컬 상태에서 댓글 제거
      const removeCommentFromList = (comments: CommentWithProfile[]): CommentWithProfile[] => {
        return comments.reduce((acc, comment) => {
          if (comment.id === commentId) {
            return acc; // 해당 댓글 제거
          }
          
          if (comment.replies) {
            return [...acc, {
              ...comment,
              replies: removeCommentFromList(comment.replies)
            }];
          }
          
          return [...acc, comment];
        }, [] as CommentWithProfile[]);
      };

      setComments(prev => removeCommentFromList(prev));
      toast.success('댓글이 삭제되었습니다.');
    } catch (error) {
      logError(error, 'Comment delete error');
      toast.error('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  // 댓글 좋아요 토글
  const toggleCommentLike = async (commentId: number): Promise<void> => {
    if (!user) {
      toast.error('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      // 현재 좋아요 상태 확인
      const { data: existingLike, error: checkError } = await supabase
        .from('likes_comments')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // 좋아요 취소
        const { error: deleteError } = await supabase
          .from('likes_comments')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (deleteError) {
          throw deleteError;
        }
      } else {
        // 좋아요 추가
        const { error: insertError } = await supabase
          .from('likes_comments')
          .insert([{
            comment_id: commentId,
            user_id: user.id,
          }]);

        if (insertError) {
          throw insertError;
        }
      }

      // 로컬 상태 업데이트
      const updateCommentInList = (comments: CommentWithProfile[]): CommentWithProfile[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
                         const newIsLiked = !comment.is_liked;
             const currentLikes = comment.likes_count || 0;
             return {
               ...comment,
               is_liked: newIsLiked,
               likes_count: newIsLiked ? currentLikes + 1 : currentLikes - 1
             };
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
    } catch (error) {
      logError(error, 'Comment like toggle error');
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // 댓글 신고
  const reportComment = async (commentId: number, reason: string): Promise<void> => {
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
        toast.error(result.error || '신고에 실패했습니다.');
        return;
      }

      // 댓글 상태 업데이트
      const updateCommentInList = (comments: CommentWithProfile[]): CommentWithProfile[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              report_count: (comment.report_count || 0) + 1,
              is_reported: true
            };
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
      logError(error, 'Comment report error');
      toast.error('신고 중 오류가 발생했습니다.');
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
      const updateCommentInList = (comments: CommentWithProfile[]): CommentWithProfile[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              report_count: Math.max((comment.report_count || 0) - 1, 0),
              is_reported: false
            };
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
      logError(error, 'Comment report cancel error');
      toast.error('신고 취소 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments: comments || [], // 추가 방어 코드
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
