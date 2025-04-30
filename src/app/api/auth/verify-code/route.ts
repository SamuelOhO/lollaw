import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { hashVerificationCode } from '@/utils/auth/verification-code'

export async function POST(request: Request) {
  try {
    const { code, email, slug } = await request.json()
    
    if (!code || !email || !slug) {
      return NextResponse.json(
        { error: '인증 코드, 이메일, 학교 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 학교 정보 확인
    const { data: schoolData, error: schoolError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('parent_id', 2)
      .single()

    if (schoolError || !schoolData) {
      console.error('학교 정보 조회 에러:', schoolError)
      return NextResponse.json(
        { error: '학교 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('학교 정보:', {
      slug,
      school_id: schoolData.id
    })

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
      .single()

    if (verificationError || !verificationData) {
      console.error('인증 정보 조회 에러:', verificationError)
      console.error('조회 조건:', {
        user_id: user.id,
        school_id: schoolData.id,
        email,
        status: 'pending'
      })

      // 디버깅을 위한 전체 인증 정보 조회
      const { data: allVerifications } = await supabase
        .from('school_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('school_id', schoolData.id)

      console.log('사용자의 모든 인증 정보:', allVerifications)

      return NextResponse.json(
        { error: '유효하지 않은 인증 정보입니다.' },
        { status: 400 }
      )
    }

    console.log('인증 정보 조회 성공:', {
      id: verificationData.id,
      created_at: verificationData.created_at,
      status: verificationData.status,
      verification_code_exists: !!verificationData.verification_code
    })

    // 인증 코드 만료 시간 확인 (5분)
    const expirationTime = new Date(verificationData.created_at)
    expirationTime.setMinutes(expirationTime.getMinutes() + 5)

    if (new Date() > expirationTime) {
      // 만료된 인증 정보 상태 업데이트
      await supabase
        .from('school_verifications')
        .update({ status: 'expired' })
        .eq('id', verificationData.id)

      return NextResponse.json(
        { error: '인증 코드가 만료되었습니다. 다시 시도해주세요.' },
        { status: 400 }
      )
    }

    // 인증 코드 검증
    const hashedInputCode = hashVerificationCode(code, email)
    console.log('디버그 정보:', {
      receivedCode: code,
      email,
      hashedInputCode,
      storedHash: verificationData.verification_code,
      match: hashedInputCode === verificationData.verification_code
    })

    if (hashedInputCode !== verificationData.verification_code) {
      return NextResponse.json(
        { error: '잘못된 인증 코드입니다.' },
        { status: 400 }
      )
    }

    // 인증 완료 처리
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('school_verifications')
      .update({ 
        verified_at: now,
        status: 'verified'
      })
      .eq('id', verificationData.id)

    if (updateError) {
      console.error('인증 상태 업데이트 에러:', updateError)
      return NextResponse.json(
        { error: '인증 상태 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: '이메일 인증이 완료되었습니다.',
      success: true 
    })

  } catch (error: any) {
    console.error('인증 코드 확인 중 오류:', error)
    return NextResponse.json(
      { error: error.message || '인증 코드 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 