// 파일 위치: /src/app/api/verify-email/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth/token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { error: '유효하지 않은 토큰입니다.' },
      { status: 400 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: '만료되거나 유효하지 않은 토큰입니다.' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 인증 상태 업데이트
    const { error: updateError } = await supabase
      .from('school_verifications')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('user_id', payload.userId)
      .eq('school_id', payload.schoolId)
      .eq('email', payload.email);

    if (updateError) throw updateError;

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-success`
    );
    
  } catch (error) {
    console.error('인증 확인 에러:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 토큰으로 인증 정보 찾기
    const { data: verification, error: verificationError } = await supabase
      .from('school_verifications')
      .select('*, categories:school_id(slug)')
      .eq('verification_token', token)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: '유효하지 않은 인증 정보입니다.' },
        { status: 400 }
      )
    }

    // 만료 시간 체크 (24시간)
    const createdAt = new Date(verification.created_at)
    const now = new Date()
    if (now.getTime() - createdAt.getTime() > 5 * 60 * 1000) { // 5분으로 수정
      return NextResponse.json(
        { error: '만료된 인증 링크입니다.' },
        { status: 400 }
      )
    }

    // 인증 상태 업데이트
    const { error: updateError } = await supabase
      .from('school_verifications')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('verification_token', token)

    if (updateError) {
      throw updateError
    }

    // 사용자-학교 관계 테이블에 추가
    const { error: relationError } = await supabase
      .from('user_schools')
      .insert({
        user_id: verification.user_id,
        school_id: verification.school_id,
        email: verification.email,
        status: 'active'
      })

    if (relationError) {
      throw relationError
    }

    return NextResponse.json({ 
      message: '이메일 인증이 완료되었습니다.',
      school_slug: verification.categories.slug
    })

  } catch (error: any) {
    console.error('인증 처리 에러:', error)
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}