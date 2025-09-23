'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySchoolIndexPage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;
    router.push(`/auth/verify-school/${slug.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">학교 이메일 인증</h1>
      <p className="text-sm text-gray-600 mb-6">학교별 게시판 이용을 위해 먼저 학교를 선택하세요.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">학교 슬러그</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="예: seoul, korea"
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          다음
        </button>
      </form>
    </div>
  );
}



