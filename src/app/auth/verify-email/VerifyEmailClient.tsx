'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input');
  const [message, setMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleVerification = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('verifying');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verificationCode,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setStatus('success');
      setMessage('이메일 인증이 완료되었습니다.');

      setTimeout(() => router.push('/'), 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || '인증 처리 중 오류가 발생했습니다.');
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 text-red-500">❌</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">잘못된 접근</h2>
          <p className="mt-2 text-sm text-gray-600">유효하지 않은 인증 링크입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'input' && (
          <form onSubmit={handleVerification}>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">이메일 인증</h2>
            <p className="mt-2 text-sm text-gray-600 mb-4">
              {email}로 전송된 6자리 인증 코드를 입력해주세요.
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              maxLength={6}
              className="w-full p-4 text-center text-2xl tracking-widest border rounded-lg mb-4"
              placeholder="000000"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
            >
              인증하기
            </button>
          </form>
        )}

        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 처리 중...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto h-12 w-12 text-green-500">✅</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 완료!</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto h-12 w-12 text-red-500">❌</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 실패</h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'

// export default function VerifyEmailClient() {
//   const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
//   const [message, setMessage] = useState('')
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const token = searchParams.get('token')

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
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ token })
//         })

//         const data = await response.json()

//         if (!response.ok) throw new Error(data.error)

//         setStatus('success')
//         setMessage('이메일 인증이 완료되었습니다.')

//         setTimeout(() => router.push('/'), 3000)

//       } catch (error: any) {
//         setStatus('error')
//         setMessage(error.message || '인증 처리 중 오류가 발생했습니다.')
//       }
//     }

//     verifyEmail()
//   }, [token, router])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 text-center">
//         {status === 'verifying' && (
//           <>
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
//               이메일 인증 처리 중...
//             </h2>
//           </>
//         )}
//         {status === 'success' && (
//           <>
//             <div className="mx-auto h-12 w-12 text-green-500">
//               ✅
//             </div>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 완료!</h2>
//           </>
//         )}
//         {status === 'error' && (
//           <>
//             <div className="mx-auto h-12 w-12 text-red-500">❌</div>
//             <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 실패</h2>
//           </>
//         )}
//         <p className="mt-2 text-sm text-gray-600">{message}</p>
//       </div>
//     </div>
//   )
// }
