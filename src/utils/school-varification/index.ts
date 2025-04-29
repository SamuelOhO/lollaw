import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { VerificationStatus } from '@/types/supabase'

export async function checkSchoolVerification(schoolId: number) {
  const supabase = createClientComponentClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { data: verification } = await supabase
      .from('school_verifications')
      .select('status')
      .eq('school_id', schoolId)
      .eq('user_id', session.user.id)
      .eq('status', 'verified')
      .single()

    return !!verification
  } catch (error) {
    console.error('학교 인증 확인 에러:', error)
    return false
  }
}

export async function getVerificationStatus(schoolId: number): Promise<VerificationStatus | null> {
  const supabase = createClientComponentClient()
  
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