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