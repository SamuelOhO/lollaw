import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import BoardClient from './BoardClient'
import { redirect } from 'next/navigation'

async function getCategoryData(supabase: any, slug: string) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError) {
    throw new Error(categoryError.message)
  }

  const { data: subcategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .order('name')

  return { category, subcategories }
}

async function getPosts(supabase: any, categoryId: number) {
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })

  return posts
}

export default async function BoardPage({ params: { slug } }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''

  let category, subcategories, displayCategory;
  try {
    const result = await getCategoryData(supabase, slug);
    category = result.category;
    subcategories = result.subcategories;
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
      </div>
    );
  }

  let posts = [];
  // 대분류(상위 카테고리)라면 첫 번째 산하 카테고리의 게시글을 대신 보여주고, UI도 해당 카테고리명으로 표시
  if (!category.parent_id && subcategories && subcategories.length > 0) {
    displayCategory = subcategories[0];
    posts = await getPosts(supabase, displayCategory.id);
  } else {
    displayCategory = category;
    posts = await getPosts(supabase, category.id);
  }

  return (
    <BoardClient
      category={category}
      subcategories={subcategories || []}
      posts={posts || []}
      pathname={pathname}
    />
  );
}
