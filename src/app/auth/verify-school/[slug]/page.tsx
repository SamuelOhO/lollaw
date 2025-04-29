// 파일 위치: /src/app/auth/verify-school/[slug]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useVerificationStore } from '@/store/verification'

// interface PageProps {
//     params: {
//       slug: string
//     }
//   }

export default function VerifySchoolPage() {
  const { slug } = useParams() as { slug: string }
  const [email, setEmail] = useState('')
  const { setStatus, setLoading, isLoading } = useVerificationStore()

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/school-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            schoolId: slug,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setStatus('pending')
      alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.')
    } catch (error) {
      console.error('인증 요청 에러:', error)
      alert('인증 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">학교 이메일 인증</h1>
      <form onSubmit={handleVerification}>
        <div className="mb-4">
          <label className="block mb-2">학교 이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="학교 이메일 주소"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '처리중...' : '인증 요청'}
        </button>
      </form>
    </div>
  )
}