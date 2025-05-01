// // 파일 위치: /src/app/api/auth/school-verification/route.ts

// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'
// import { sendVerificationEmail } from '@/utils/email/sendEmail'
// import crypto from 'crypto'

// export async function POST(request: Request) {
//   try {
//     const { email, slug } = await request.json()
//     const cookieStore = cookies()
//     const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

//     // 1. 사용자 확인
//     const { data: { user }, error: userError } = await supabase.auth.getUser()
//     if (!user || userError) {
//       return NextResponse.json(
//         { error: '로그인이 필요합니다.' },
//         { status: 401 }
//       )
//     }

//     // 2. 학교(카테고리) 정보 확인
//     const { data: school, error: schoolError } = await supabase
//       .from('categories')
//       .select('id, name')
//       .eq('slug', slug)
//       .eq('parent_id', 2)
//       .single()

//     if (schoolError || !school) {
//       return NextResponse.json(
//         { error: '학교 정보를 찾을 수 없습니다.' },
//         { status: 404 }
//       )
//     }

//     // 3. 이메일 도메인 확인
//     const emailDomain = email.split('@')[1]
//     const { data: validDomain, error: domainError } = await supabase
//       .from('school_email_domains')
//       .select('*')
//       .eq('school_id', school.id)
//       .eq('domain', emailDomain)
//       .single()

//     if (domainError || !validDomain) {
//       return NextResponse.json(
//         { error: '유효하지 않은 학교 이메일입니다.' },
//         { status: 400 }
//       )
//     }

//     // 4. 이메일 발송
//     const { success, error: emailError } = await sendVerificationEmail(
//       email,
//       school.name,
//       crypto.randomBytes(32).toString('hex')
//     )

//     if (!success) {
//       return NextResponse.json(
//         { error: emailError || '이메일 발송에 실패했습니다.' },
//         { status: 500 }
//       )
//     }

//     // 5. 인증 요청 생성
//     const { error: verificationError } = await supabase
//       .from('school_verifications')
//       .insert({
//         user_id: user.id,
//         school_id: school.id,
//         email: email,
//         status: 'pending',
//         verification_method: 'email',
//         // verification_token 컬럼이 없으므로 제거
//       })

//     if (verificationError) {
//       return NextResponse.json(
//         { error: '인증 정보 저장에 실패했습니다.' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({ 
//       message: '인증 이메일이 발송되었습니다.',
//       success: true 
//     })

//   } catch (error: any) {
//     console.error('인증 처리 에러:', error)
//     return NextResponse.json(
//       { error: error.message || '인증 처리 중 오류가 발생했습니다.' },
//       { status: 500 }
//     )
//   }
// }



import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { generateVerificationCode, hashVerificationCode } from '@/utils/auth/verification-code'
import { sendVerificationEmail } from '@/utils/email/sendEmail'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    const { schoolId, verificationCode } = await request.json()

    // 여기에서 실제 학교 인증 로직을 구현
    // 예: 이메일 도메인 확인, 학생증 인증 등

    // 임시로 성공 응답
    return NextResponse.json({ message: '학교 인증이 완료되었습니다.' })
  } catch (error) {
    console.error('School verification error:', error)
    return NextResponse.json(
      { error: '학교 인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}