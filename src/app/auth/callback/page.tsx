// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// export default function AuthCallback() {
//   const router = useRouter()
//   const supabase = createClientComponentClient()

//   useEffect(() => {
//     const exchangeSession = async () => {
//     //   const queryString = window.location.search
//     //   const { error } = await supabase.auth.exchangeCodeForSession(queryString)

//     //   if (!error) {
//     //     window.location.href = '/community' // ✅ 서버가 쿠키 인식하도록 완전 새로고침
//     //   } else {
//     //     console.error('로그인 세션 처리 실패:', error.message)
//     //     router.replace('/login')
//     //   }
//     const params = new URLSearchParams(window.location.search);
//   const code = params.get('code');
  
//   if (code) {
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       window.location.href = '/community';
//     } else {
//       console.error('로그인 세션 처리 실패:', error.message);
//       router.replace('/login');
//     }
//   } else {
//     console.error('인증 코드가 없습니다');
//     router.replace('/login');
//   }
//     }

//     exchangeSession()
//   }, [router, supabase])

//   return <p className="p-6 text-center">로그인 처리 중입니다...</p>
// }

// // auth/callback/page.tsx 수정
// 'use client'
// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// export default function AuthCallback() {
//   const router = useRouter()
//   const supabase = createClientComponentClient()
  
//   useEffect(() => {
//     const exchangeSession = async () => {
//       try {
//         // URL에서 코드 추출
//         const params = new URLSearchParams(window.location.search)
//         const code = params.get('code')
        
//         console.log('Auth code:', code)
//         // localStorage에서 code_verifier 확인
//         const codeVerifier = localStorage.getItem('supabase.auth.code_verifier')
//         console.log('Code verifier exists:', !!codeVerifier)
        
//         if (!code) {
//           console.error('인증 코드가 없습니다')
//           router.replace('/login')
//           return
//         }
        
//         // 전체 URL 쿼리스트링을 전달 (내부적으로 code와 code_verifier를 처리)
//         const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.search)
        
//         if (error) {
//           console.error('로그인 세션 처리 실패:', error.message)
//           router.replace('/login')
//           return
//         }
        
//         console.log('세션 교환 성공:', data)
        
//         // code_verifier 정리
//         localStorage.removeItem('supabase.auth.code_verifier')
        
//         // 세션이 설정되었으므로 리디렉션
//         window.location.href = '/community'
//       } catch (err) {
//         console.error('인증 과정 예외 발생:', err)
//         router.replace('/login')
//       }
//     }
    
//     exchangeSession()
//   }, [router, supabase])
  
//   return <p className="p-6 text-center">로그인 처리 중입니다...</p>
// }

// app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        
        if (!code) {
          throw new Error('인증 코드가 없습니다')
        }

        // 세션 교환
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          throw error
        }

        // 세션 교환 후 바로 community로 이동
        window.location.replace('/community')

      } catch (error) {
        console.error('인증 콜백 처리 오류:', error)
        window.location.replace('/login')
      }
    }

    handleCallback()
  }, [supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg">로그인 처리 중입니다...</p>
      </div>
    </div>
  )
}