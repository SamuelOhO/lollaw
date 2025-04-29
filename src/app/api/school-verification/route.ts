// 파일 위치: /src/app/api/school-verification/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/utils/email/sendEmail';
import { generateVerificationToken } from '@/utils/auth/token';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { email, schoolId } = await request.json();
    
    // 1. 현재 사용자 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2. 이메일 도메인 확인
    const { data: school } = await supabase
      .from('categories')
      .select('name, id')
      .eq('id', schoolId)
      .single();

    if (!school) {
      return NextResponse.json(
        { error: '학교 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 3. 인증 토큰 생성
    const verificationToken = generateVerificationToken({
      email,
      schoolId,
      userId: session.user.id
    });

    // 4. 인증 이메일 발송
    const emailSent = await sendVerificationEmail(
      email,
      verificationToken,
      school.name
    );

    if (!emailSent) {
      throw new Error('이메일 발송 실패');
    }

    // 5. 인증 요청 상태 저장
    const { error: dbError } = await supabase
      .from('school_verifications')
      .insert({
        user_id: session.user.id,
        school_id: schoolId,
        email,
        status: 'pending',
        verification_method: 'email'
      });

    if (dbError) throw dbError;

    return NextResponse.json({ 
      message: '인증 이메일이 발송되었습니다.' 
    });
    
  } catch (error) {
    console.error('인증 처리 에러:', error);
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}