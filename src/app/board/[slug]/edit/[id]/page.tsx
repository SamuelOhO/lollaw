'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

interface EditPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        toast.error('게시글을 불러오는데 실패했습니다.');
        router.push(`/board/${params.slug}`);
        return;
      }

      if (post.user_id !== user.id) {
        toast.error('게시글 수정 권한이 없습니다.');
        router.push(`/board/${params.slug}`);
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setIsLoading(false);
    };

    fetchPost();
  }, [params.id, params.slug, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('게시글이 수정되었습니다.');
      router.push(`/board/${params.slug}/post/${params.id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="내용을 입력하세요"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
} 