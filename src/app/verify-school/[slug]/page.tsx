// File: /src/app/verify-school/[slug]/page.tsx
// Description: 학교 이메일 인증 페이지

'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function VerifySchoolPage() {
  const { slug } = useParams() as { slug: string }
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. 학교 정보 가져오기
      const { data: school } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!school) throw new Error('학교 정보를 찾을 수 없습니다.')

      // 2. 이메일 도메인 체크
      const emailDomain = email.split('@')[1]
      const validDomains: Record<string, string[]> = {
        'yonsei': ['yonsei.ac.kr', 'yonsei.edu'],
        'konkuk': ['konkuk.ac.kr']
        // 다른 학교 도메인 추가
      }

      if (!validDomains[school.slug]?.includes(emailDomain)) {
        alert('올바른 학교 이메일을 입력해주세요.')
        return
      }

      // 3. 인증 요청 생성
      const { error: verificationError } = await supabase
        .from('school_verifications')
        .insert({
          school_id: school.id,
          email,
          verification_method: 'email',
          status: 'pending'
        })

      if (verificationError) throw verificationError

      // 4. 이메일 인증 메일 발송 (별도 서버리스 함수 필요)
      
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
      <h1 className="text-2xl font-bold mb-6">학교 인증</h1>
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
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? '처리중...' : '인증 요청'}
        </button>
      </form>
    </div>
  )
}