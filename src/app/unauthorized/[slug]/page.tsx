'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { logError } from '@/utils/error-handler';

interface UnauthorizedPageProps {
  params: {
    slug: string;
  };
}

export default function UnauthorizedPage({ params }: UnauthorizedPageProps) {
  const router = useRouter();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const { data: schoolData, error: schoolError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', params.slug)
          .eq('parent_id', 2)
          .single();

        if (schoolError) throw schoolError;
        setSchool(schoolData);
      } catch (error) {
        logError(error, 'School info fetch error');
        setError('학교 정보를 찾을 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolInfo();
  }, [params.slug]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/school-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          slug: params.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // 인증 이메일 전송 성공
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setError(error.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">{error || '학교 정보를 찾을 수 없습니다.'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {school.name} 인증
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          학교 이메일을 통해 재학/졸업생 인증을 진행해주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleVerification}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                학교 이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="example@university.ac.kr"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSubmitting ? '처리 중...' : '인증 이메일 받기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
