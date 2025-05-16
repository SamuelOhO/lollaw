'use client';

import { useState } from 'react';
import { useVerificationStore } from '@/store/verification';
import * as React from 'react';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function VerifySchoolPage({ params }: PageProps) {
  const { slug } = params;
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const { setStatus, setLoading, isLoading } = useVerificationStore();

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/school-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '인증 요청 중 오류가 발생했습니다.');
      }

      setShowCodeInput(true);
      setStatus('pending');
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (error: any) {
      console.error('인증 요청 에러:', error);
      alert(error.message || '인증 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          email,
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '인증 코드 확인 중 오류가 발생했습니다.');
      }

      setStatus('verified');
      alert('이메일 인증이 완료되었습니다.');
      window.location.href = `/board/${slug}`;
    } catch (error: any) {
      console.error('인증 코드 확인 에러:', error);
      alert(error.message || '인증 코드 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">학교 이메일 인증</h1>
      {!showCodeInput ? (
        <form onSubmit={handleSendVerification}>
          <div className="mb-4">
            <label className="block mb-2">학교 이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
            {isLoading ? '처리중...' : '인증 코드 받기'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-4">
            <label className="block mb-2">인증 코드</label>
            <input
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              className="w-full p-2 border rounded text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              {email}로 발송된 6자리 인증 코드를 입력해주세요.
            </p>
          </div>
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? '처리중...' : '인증 확인'}
            </button>
            <button
              type="button"
              onClick={() => setShowCodeInput(false)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
            >
              이메일 다시 입력
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
