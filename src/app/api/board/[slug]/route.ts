import { createServerSupabase } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createServerSupabase()

  try {
    // 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 학교 게시판인 경우 (parent_id가 2)
    if (category.parent_id === 2) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      // 로그인하지 않은 경우
      if (userError || !user) {
        return NextResponse.json(
          { message: `${category.name} 게시판을 이용하시려면 로그인과 학교인증이 필요합니다.` },
          { status: 401 }
        )
      }

      // 학교 인증 체크
      const { data: verifications, error: verificationError } = await supabase
        .from('school_verifications')
        .select('school_id, status')
        .eq('user_id', user.id)
        .eq('status', 'verified')
        .not('verified_at', 'is', null)

      // 학교 인증이 없는 경우
      if (verificationError || !verifications || verifications.length === 0) {
        return NextResponse.redirect(new URL(`/unauthorized/${params.slug}`, request.url))
      }

      // 다른 학교 인증된 경우
      const verifiedSchool = verifications[0]
      if (verifiedSchool.school_id !== category.id) {
        return NextResponse.redirect(new URL(`/unauthorized/${params.slug}?reason=different_school`, request.url))
      }
    }

    // 게시글 조회
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('category_id', category.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      category,
      posts: posts || []
    })

  } catch (error) {
    console.error('API 에러:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 