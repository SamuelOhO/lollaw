import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hashVerificationCode } from '@/utils/auth/verification-code';
import { createApiResponse, createErrorResponse, handleSupabaseError, logError } from '@/utils/error-handler';

export async function POST(request: Request) {
  try {
    const { code, email, slug } = await request.json();

    // 입력 검증
    if (!code || !email || !slug) {
      const errorResponse = createErrorResponse('인증 코드, 이메일, 학교 정보가 필요합니다.', 400);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    const supabase = await createClient();

    // 사용자 정보 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (!user || userError) {
      logError(userError, 'User authentication check');
      const errorResponse = createErrorResponse('로그인이 필요합니다.', 401);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // 학교 정보 확인
    const { data: schoolData, error: schoolError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('parent_id', 2)
      .single();

    if (schoolError || !schoolData) {
      logError(schoolError, 'School category lookup');
      const errorResponse = createErrorResponse('학교 정보를 찾을 수 없습니다.', 404);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // 가장 최근 인증 정보 확인
    const { data: verificationData, error: verificationError } = await supabase
      .from('school_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolData.id)
      .eq('email', email)
      .eq('status', 'pending')
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verificationData) {
      logError(verificationError, 'Verification data lookup');
      
      // 디버깅을 위한 전체 인증 정보 조회
      const { data: allVerifications } = await supabase
        .from('school_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('school_id', schoolData.id);

      logError({ allVerifications }, 'All verifications for debugging');

      const errorResponse = createErrorResponse('유효하지 않은 인증 정보입니다.', 400);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // 인증 코드 만료 시간 확인 (5분)
    const expirationTime = new Date(verificationData.created_at);
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);

    if (new Date() > expirationTime) {
      // 만료된 인증 정보 상태 업데이트
      await supabase
        .from('school_verifications')
        .update({ status: 'expired' })
        .eq('id', verificationData.id);

      const errorResponse = createErrorResponse('인증 코드가 만료되었습니다. 다시 시도해주세요.', 400);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // 인증 코드 검증
    const hashedInputCode = hashVerificationCode(code, email);
    
    if (hashedInputCode !== verificationData.verification_code) {
      const errorResponse = createErrorResponse('잘못된 인증 코드입니다.', 400);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // 인증 완료 처리
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('school_verifications')
      .update({
        verified_at: now,
        status: 'verified',
      })
      .eq('id', verificationData.id);

    if (updateError) {
      logError(updateError, 'Verification status update');
      const errorResponse = createErrorResponse('인증 상태 업데이트 중 오류가 발생했습니다.', 500);
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    const successResponse = createApiResponse(
      null,
      '이메일 인증이 완료되었습니다.'
    );
    return NextResponse.json(successResponse);

  } catch (error: any) {
    logError(error, 'Verification code check');
    const errorResponse = createErrorResponse(
      error.message || '인증 코드 확인 중 오류가 발생했습니다.',
      500
    );
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
