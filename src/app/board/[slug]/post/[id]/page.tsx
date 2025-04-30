// app/board/[slug]/post/[id]/page.tsx
import { createServerSupabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
// import Link from 'next/link'

interface PageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  // 1. 게시글 가져오기
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .maybeSingle()

  if (postError || !post) {
    console.log('! 게시글:', post)
    console.log('❌ 게시글 조회 실패:', postError)
    notFound()
  }

//   // 2. 카테고리 확인
//   const { data: category } = await supabase
//     .from('categories')
//     .select('*')
//     .eq('slug', slug)
//     .single()

//   if (category?.requires_auth) {
//     const { data: { session } } = await supabase.auth.getSession()
//     if (!session) {
//       return (
//         <div className="text-center py-8">
//           <p className="text-red-500">로그인이 필요한 게시판입니다.</p>
//           <Link href="/login" className="text-blue-600">로그인하러 가기</Link>
//         </div>
//       )
//     }
//   }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        작성자: {post.profiles?.display_name || '익명'} / 작성일: {new Date(post.created_at).toLocaleString()}
      </p>
      <div className="whitespace-pre-wrap text-gray-800">{post.content}</div>
    </div>
  )
}