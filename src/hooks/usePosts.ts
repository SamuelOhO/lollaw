import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import type { Post } from '@/types/models';

export function usePosts(categoryId: number | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (categoryId == null) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        // 게시글 가져오기
        const { data: posts, error } = await supabase
          .from('posts')
          .select(
            `
            *,
            profiles:user_id (
              display_name
            )
          `
          )
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(posts || []);
      } catch (error) {
        console.error('게시글 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  return { posts, session, loading };
}
