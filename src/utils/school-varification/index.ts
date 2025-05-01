import { createClient } from '@/utils/supabase/server'
import type { VerificationStatus } from '@/app/supabase'

export async function checkSchoolVerification(schoolId: number) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      isVerified: false,
      status: 'not_logged_in' as VerificationStatus,
      message: '로그인이 필요합니다.'
    }
  }

  const { data: verification, error: verificationError } = await supabase
    .from('school_verifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('school_id', schoolId)
    .single()

  if (verificationError) {
    if (verificationError.code === 'PGRST116') {
      return {
        isVerified: false,
        status: 'not_verified' as VerificationStatus,
        message: '학교 인증이 필요합니다.'
      }
    }
    throw verificationError
  }

  if (!verification) {
    return {
      isVerified: false,
      status: 'not_verified' as VerificationStatus,
      message: '학교 인증이 필요합니다.'
    }
  }

  if (verification.status === 'verified') {
    return {
      isVerified: true,
      status: 'verified' as VerificationStatus,
      message: '인증이 완료되었습니다.'
    }
  }

  return {
    isVerified: false,
    status: verification.status as VerificationStatus,
    message: '인증이 진행 중입니다.'
  }
}

export async function getVerificationStatus(schoolId: number): Promise<VerificationStatus | null> {
  const supabase = await createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data: verification } = await supabase
      .from('school_verifications')
      .select('status')
      .eq('school_id', schoolId)
      .eq('user_id', session.user.id)
      .single()

    return verification?.status || null
  } catch (error) {
    console.error('인증 상태 확인 에러:', error)
    return null
  }
}