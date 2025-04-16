// // app/board/[slug]/page.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostList from '@/components/PostList'
import * as React from 'react'

interface BoardPageProps {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const slug = (await params).slug
  if (!(await params)?.slug) notFound()
    // 2. cookies()는 동기 함수
  const cookieStore = await cookies()
  // 3. 쿠키 객체 만들기
  const cookieObject = Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))

    //   // 4. Supabase 클라이언트 생성
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
        cookies: {
            get(name) {
            return cookieObject[name]
            },
            set() {},
            remove() {}
        }
        }
    )

  try {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (categoryError || !category) {
      console.error('카테고리 로딩 오류:', categoryError)
      notFound()
    }

    const { data: { session } } = await supabase.auth.getSession()

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
  } catch (error) {
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