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
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateVerificationCode, hashVerificationCode } from '@/utils/auth/verification-code'
import { sendVerificationEmail } from '@/utils/email/sendEmail'
import { createServerSupabase } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, slug } = await request.json()
    
    if (!email || !slug) {
      return NextResponse.json(
        { error: '이메일과 학교 정보가 필요합니다.' },
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
      .select('id, name')
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
      school_id: schoolData.id,
      school_name: schoolData.name
    })

    // 이메일 도메인 확인
    const emailDomain = email.split('@')[1]
    const { data: validDomain, error: domainError } = await supabase
      .from('school_email_domains')
      .select('*')
      .eq('school_id', schoolData.id)
      .eq('domain', emailDomain)
      .single()

    if (domainError || !validDomain) {
      return NextResponse.json(
        { error: '유효하지 않은 학교 이메일입니다.' },
        { status: 400 }
      )
    }

    // 6자리 인증 코드 생성
    const verificationCode = generateVerificationCode()
    const hashedCode = hashVerificationCode(verificationCode, email)

    // 기존 인증 정보 삭제
    const { error: deleteError } = await supabase
      .from('school_verifications')
      .delete()
      .eq('user_id', user.id)
      .eq('school_id', schoolData.id)

    if (deleteError) {
      console.error('기존 인증 정보 삭제 에러:', deleteError)
    }

    // 새로운 인증 정보 저장
    const { data: insertData, error: insertError } = await supabase
      .from('school_verifications')
      .insert({
        user_id: user.id,
        school_id: schoolData.id,
        verification_method: 'email',
        verification_code: hashedCode,
        email: email,
        status: 'pending',
        verified_at: null
      })
      .select()
      .single()

    if (insertError) {
      console.error('인증 정보 저장 에러:', insertError)
      return NextResponse.json(
        { error: '인증 정보 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('인증 정보 저장 완료:', {
      id: insertData?.id,
      user_id: user.id,
      school_id: schoolData.id,
      email,
      status: 'pending',
      verification_code_length: hashedCode.length
    })

    // 인증 이메일 발송
    const emailResult = await sendVerificationEmail(
      email,
      schoolData.name,
      verificationCode
    )

    if (!emailResult.success) {
      // 이메일 전송 실패 시 생성된 인증 정보 삭제
      await supabase
        .from('school_verifications')
        .delete()
        .eq('id', insertData.id)

      return NextResponse.json(
        { error: emailResult.error || '이메일 전송에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: '인증 코드가 이메일로 발송되었습니다.',
      success: true 
    })

  } catch (error: any) {
    console.error('인증 처리 에러:', error)
    return NextResponse.json(
      { error: error.message || '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}