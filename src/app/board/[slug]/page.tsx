// // app/board/[slug]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import PostList from '@/components/PostList'
import * as React from 'react'

interface BoardPageProps {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  
  const slug = (await params).slug
  if (!slug) notFound()

  // cookies를 await로 처리
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  

  try {
    // 1. 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      console.error('카테고리 로딩 오류:', categoryError)
      notFound()
    }

    // const { data: { session } } = await supabase.auth.getSession()


    // 2. 학교 게시판(parent_id가 2)이고 인증이 필요한 경우
    if (category.parent_id === 2 && category.requires_auth) {
      // const { data: { session } } = await supabase.auth.getSession()
      
      // // 2-1. 로그인 체크
      // if (!session) {
      //   // 로그인 페이지로 리다이렉트 시 현재 URL을 state로 전달
      //   return redirect('/auth/login')
      // }

      // getUser()로 변경
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!user || userError) {
        return redirect(`/auth/login?redirect=/board/${slug}`)
      }

      // 2-2. 학교 인증 확인
      // const { data: verification } = await supabase
      const { data: verification } = await supabase
        .from('school_verifications')
        .select('*')
        .eq('school_id', category.id)
        // .eq('user_id', session.user.id)
        .eq('user_id', user.id)
        .eq('status', 'verified')
        .single()

      if (!verification) {
        // unauthorized 페이지로 리다이렉트하면서 slug 전달
        return redirect(`/unauthorized/${slug}`)
      }
    }

    // 3. 게시판 표시
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-2xl font-bold mt-2">{category.name}</h1>
        </div>
        <PostList 
          categoryId={category.id}
          requiresAuth={category.requires_auth}
          slug={slug}
        />
      </div>
    )
  } catch (error: any) {
    // 리다이렉트 에러는 무시
    if (error?.message === 'NEXT_REDIRECT') {
      throw error
    }

    console.error('페이지 로딩 오류:', error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500">페이지를 불러오는데 실패했습니다.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          홈으로 돌아가기
        </Link>
      </div>
    )
  }
}