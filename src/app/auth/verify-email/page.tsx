'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: localStorage.getItem('signupEmail') || '',
      });

      if (error) throw error;

      setMessage('인증 이메일이 재전송되었습니다. 이메일함을 확인해주세요.');
    } catch (error: any) {
      setError(error.message || '이메일 재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold mb-8">이메일 인증</h1>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-lg text-gray-700 mb-4">회원가입이 거의 완료되었습니다!</p>
          <p className="text-gray-600 mb-4">
            입력하신 이메일 주소로 인증 링크를 보내드렸습니다.
            <br />
            이메일을 확인하시고 링크를 클릭하여 인증을 완료해주세요.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            이메일이 도착하지 않았다면 스팸 메일함을 확인해주세요.
          </p>
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '전송 중...' : '인증 이메일 다시 받기'}
          </button>
          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Suspense } from 'react'

// export default function VerifyEmailPage() {
//   const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
//   const [message, setMessage] = useState('')
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const token = searchParams.get('token')
// //   const supabase = createClientComponentClient()

//   useEffect(() => {
//     const verifyEmail = async () => {
//       if (!token) {
//         setStatus('error')
//         setMessage('유효하지 않은 인증 링크입니다.')
//         return
//       }

//       try {
//         const response = await fetch('/api/auth/verify-email', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ token })
//         })

//         const data = await response.json()

//         if (!response.ok) {
//           throw new Error(data.error)
//         }

//         setStatus('success')
//         setMessage('이메일 인증이 완료되었습니다.')

//         // 3초 후 메인 페이지로 리다이렉트
//         setTimeout(() => {
//           router.push('/')
//         }, 3000)

//       } catch (error: any) {
//         setStatus('error')
//         setMessage(error.message || '인증 처리 중 오류가 발생했습니다.')
//       }
//     }

//     verifyEmail()
//   }, [token, router])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           {status === 'verifying' && (
//             <>
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//               <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//                 이메일 인증 처리 중...
//               </h2>
//             </>
//           )}

//           {status === 'success' && (
//             <>
//               <div className="mx-auto h-12 w-12 text-green-500">
//                 <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//                 인증 완료!
//               </h2>
//             </>
//           )}

//           {status === 'error' && (
//             <>
//               <div className="mx-auto h-12 w-12 text-red-500">
//                 <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </div>
//               <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//                 인증 실패
//               </h2>
//             </>
//           )}

//           <p className="mt-2 text-sm text-gray-600">
//             {message}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
