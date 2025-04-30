import { createServerSupabase } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import CommentSection from '@/components/comments/CommentSection'
import Link from 'next/link'

interface PageProps {
  params: {
    slug: string
    id: string
  }
}

export default async function PostPage({ params }: PageProps) {
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
      <div className="mb-6">
        <Link
          href={`/board/${slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-3 mb-6 text-gray-600">
          <div className="flex items-center gap-2">
            {post.profiles.avatar_url && (
              <img
                src={post.profiles.avatar_url}
                alt="프로필"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{post.profiles.display_name}</span>
          </div>
          <span>•</span>
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
          </time>
          {post.updated_at !== post.created_at && (
            <>
              <span>•</span>
              <span className="text-gray-500">
                수정됨: {format(new Date(post.updated_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
              </span>
            </>
          )}
        </div>

        <div className="prose max-w-none">
          {post.content}
        </div>
      </article>

      {/* 댓글 섹션 */}
      <CommentSection postId={parseInt(id)} />
    </div>
  )
} 