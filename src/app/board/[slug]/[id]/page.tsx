import { createServerSupabase } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
    id: string
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug, id } = params
  const supabase = await createServerSupabase()

  // 1. 카테고리 확인
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    console.error('❌ 카테고리 조회 실패:', categoryError)
    notFound()
  }

  // 2. 학교 게시판 권한 체크
  if (category.parent_id === 2) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }

    const { data: verifications, error: verificationError } = await supabase
      .from('school_verifications')
      .select('school_id, status')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .not('verified_at', 'is', null)
      .single()

    if (verificationError || !verifications) {
      throw new Error('학교 인증이 필요합니다.')
    }

    if (verifications.school_id !== category.id) {
      throw new Error('해당 학교 게시판에 접근 권한이 없습니다.')
    }
  }

  // 3. 게시글 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .eq('category_id', category.id)  // 카테고리 ID도 확인
    .single()

  if (postError || !post) {
    console.error('❌ 게시글 조회 실패:', postError)
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0">
            {post.profiles.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.display_name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {post.profiles.display_name}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">{post.content}</div>
        </div>
      </div>
    </div>
  )
} 