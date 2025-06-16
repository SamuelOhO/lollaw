'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import ReportModal from '@/components/molecules/report-modal';

interface PostDetailProps {
  postId: string;
  slug: string;
}

export default function PostDetail({ postId, slug }: PostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: post, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('게시글 조회 중 오류:', error);
        toast.error('게시글을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      setPost(post);
      setIsLoading(false);

      // 좋아요 상태 확인
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!likeData);
      }

      // 좋아요 수 조회
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', postId);

      setLikesCount(count || 0);
    };

    fetchPost();
  }, [postId, supabase]);

  const handleLike = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!user || post.user_id !== user.id) {
      toast.error('삭제 권한이 없습니다.');
      return;
    }

    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('게시글이 삭제되었습니다.');
      router.push(`/board/${slug}`);
    } catch (error) {
      console.error('게시글 삭제 중 오류:', error);
      toast.error('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  const isAuthor = user && post.user_id === user.id;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              작성자: {post.profiles?.username || '알 수 없음'} |{' '}
              {format(new Date(post.created_at), 'PPP', { locale: ko })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 ${
                isLiked
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span>👍</span>
              <span>{likesCount}</span>
            </button>
            {isAuthor ? (
              <>
                <button
                  onClick={() => router.push(`/board/${slug}/edit/${postId}`)}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowReportModal(true)}
                className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                신고
              </button>
            )}
          </div>
        </div>
        <div className="prose max-w-none dark:prose-invert">
          {post.content}
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={postId}
        targetType="post"
      />
    </div>
  );
} 