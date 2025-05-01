// // src/app/page.tsx
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { CardStack, CardItem } from '@/components/ui/card-stack'
import ClientSection from '@/components/sections/SchoolSection'
import { Database } from '@/types/database.types'

export const dynamic = 'force-dynamic'

type PostWithProfile = {
  id: number;
  title: string;
  content: string;
  category_id: number;
  categories: {
    name: string;
    slug: string;
  };
  profiles: {
    display_name: string | null;
  } | null;
};

async function getTopPosts(parentCategoryId: number): Promise<CardItem[]> {
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
      .select(`
        id,
        title,
        content,
        category_id,
        user_id,
        categories!inner (
          name,
          slug
        )
      `)
      .in('category_id', categoryIds);

    if (postsError || !posts) {
      console.error('Error fetching posts:', postsError);
      return [];
    }

    // 게시글의 좋아요 수를 가져옵니다
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('post_id');

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return [];
    }

    // 게시글별 좋아요 수를 계산
    const likesCount = (likes || []).reduce((acc, like) => {
      acc[like.post_id] = (acc[like.post_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // 사용자 정보를 가져옵니다
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', posts.map(post => post.user_id));

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // 좋아요 수를 기준으로 정렬하고 상위 5개만 선택
    const postsWithLikes = (posts as unknown as Array<{
      id: number;
      title: string | null;
      content: string | null;
      user_id: string;
      categories: {
        name: string;
        slug: string;
      };
    }>).map(post => ({
      id: post.id,
      title: post.title || '제목 없음',
      author: profiles?.find(p => p.id === post.user_id)?.display_name || '익명',
      content: post.content || '내용 없음',
      likes: likesCount[post.id] || 0,
      categoryName: post.categories.name,
      categorySlug: post.categories.slug
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

    return postsWithLikes.map(post => ({
      id: post.id,
      title: post.title || '제목 없음',
      author: post.author,
      content: post.content || '내용 없음',
      likes: post.likes,
      categoryName: post.categoryName,
      categorySlug: post.categorySlug
    }));

  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

export default async function Home() {
  const freeboardData = await getTopPosts(1);
  const leetData = await getTopPosts(3);

  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* 로고 섹션 */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold" style={{ color: '#FF8A37' }}>
          로스쿨을 얘기하다, 롤로
        </h1>
      </div>

      {/* 게시판 섹션들을 감싸는 컨테이너 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 자유게시판 섹션 */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-8 pl-2.5">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                자유게시판
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                로그인 없이 자유롭게 이용! <br />
                로스쿨에 관심있는 사람부터 교수님까지
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
              <Link
                href="/board/free"
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                게시판 바로가기
              </Link>
            </div>
          </div>
          <div className="relative mt-16 h-[230px]">
            <CardStack items={freeboardData} />
          </div>
        </div>

        {/* 로준게시판 섹션 */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-8 pl-2.5">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              로준게시판
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
              LEET, 자기소개서, 면접 등 정보공유
              <br />
              스터디 모집 등 로준생들을 위한 게시판
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
            <Link
                href="/board/free-student"
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                게시판 바로가기
              </Link>
              </div>
          </div>
          <div className="relative mt-16 h-[230px]">
            <CardStack items={leetData} />
          </div>
        </div>

        {/* 학교별 게시판 섹션 */}
        <div className="lg:col-span-1">
           <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-4 pl-2.5">
            {/* 왼쪽 설명 */}
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                학교별 게시판
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                재학/졸업 인증시 이용 가능
                <br />
                우리 학교만의 프라이빗한 게시판
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
                    <Link
                        href="/board/schools"
                        className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        게시판 바로가기
                      </Link>
                  </div>
          </div>

          {/* 카드 섹션 */}
          <div className="relative mt-16 h-[230px]">
            <ClientSection />
          </div>
        </div>
      </div>
    </main>
  );
}