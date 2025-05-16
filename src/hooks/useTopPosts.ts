import { createClient } from '@/utils/supabase/server';

export interface TopPost {
  id: number;
  title: string;
  author: string;
  content: string;
  likes: number;
  categoryName: string;
  categorySlug: string;
}

export async function getTopPosts(parentCategoryId: number): Promise<TopPost[]> {
  try {
    const supabase = await createClient();

    // 먼저 해당 부모 카테고리의 모든 하위 카테고리 ID를 가져옵니다
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .or(`id.eq.${parentCategoryId},parent_id.eq.${parentCategoryId}`);

    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return [];
    }

    const categoryIds = categories.map(cat => cat.id);

    // 게시글 정보를 가져옵니다
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        content,
        category_id,
        user_id,
        categories!inner (
          name,
          slug
        )
      `
      )
      .in('category_id', categoryIds);

    if (postsError || !posts) {
      console.error('Error fetching posts:', postsError);
      return [];
    }

    // 게시글의 좋아요 수를 가져옵니다
    const { data: likes, error: likesError } = await supabase.from('likes').select('post_id');

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return [];
    }

    // 게시글별 좋아요 수를 계산
    const likesCount = (likes || []).reduce(
      (acc, like) => {
        acc[like.post_id] = (acc[like.post_id] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    // 사용자 정보를 가져옵니다
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in(
        'id',
        posts.map(post => post.user_id)
      );

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // 좋아요 수를 기준으로 정렬하고 상위 5개만 선택
    return (
      posts as unknown as Array<{
        id: number;
        title: string | null;
        content: string | null;
        user_id: string;
        categories: {
          name: string;
          slug: string;
        };
      }>
    )
      .map(post => ({
        id: post.id,
        title: post.title || '제목 없음',
        author: profiles?.find(p => p.id === post.user_id)?.display_name || '익명',
        content: post.content || '내용 없음',
        likes: likesCount[post.id] || 0,
        categoryName: post.categories.name,
        categorySlug: post.categories.slug,
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}
