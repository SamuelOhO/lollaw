'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UnauthorizedPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto h-12 w-12 text-red-500">❌</div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">접근 권한이 없습니다</h2>
        <p className="mt-2 text-sm text-gray-600">
          이 게시판에 접근하기 위해서는 학교 인증이 필요합니다.
        </p>
        <div className="mt-5">
          <Link
            href={`/auth/verify-school/${slug}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            학교 인증하기
          </Link>
        </div>
      </div>
    </div>
  );
}
