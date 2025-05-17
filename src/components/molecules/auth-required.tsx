'use client';

import Link from 'next/link';

export default function AuthRequired() {
  return (
    <div className="bg-gradient-to-br from-blue-500/40 to-purple-600/40 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        로그인이 필요한 서비스입니다
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-200 mb-8">
        로그인 후 재학생/졸업생 인증을 진행해주세요.
      </p>
      <Link
        href="/auth/login"
        className="inline-block px-6 py-3 bg-white/90 hover:bg-white text-blue-600 rounded-lg transition-colors font-semibold shadow-sm"
      >
        로그인하기
      </Link>
    </div>
  );
}
