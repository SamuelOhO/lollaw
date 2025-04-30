'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('유효하지 않은 인증 링크입니다.')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) throw new Error(data.error)

        setStatus('success')
        setMessage('이메일 인증이 완료되었습니다.')

        setTimeout(() => router.push('/'), 3000)

      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || '인증 처리 중 오류가 발생했습니다.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              이메일 인증 처리 중...
            </h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mx-auto h-12 w-12 text-green-500">
              ✅
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 완료!</h2>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mx-auto h-12 w-12 text-red-500">❌</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">인증 실패</h2>
          </>
        )}
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}