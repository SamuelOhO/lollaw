// src/app/mypage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/database.types';
import { toast } from 'react-hot-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError('프로필을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('계정 삭제에 실패했습니다.');
      }

      toast.success('계정이 성공적으로 삭제되었습니다.');
      router.push('/');
    } catch (err) {
      toast.error('계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">닉네임</label>
              <p className="mt-1">{profile?.display_name || '미설정'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">사용자 유형</label>
              <p className="mt-1">
                {profile?.user_type === 'lawyer'
                  ? '변호사'
                  : profile?.user_type === 'law_student'
                    ? '로스쿨생'
                    : '일반인'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">인증 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">학교 인증 상태</label>
              <p className="mt-1">{profile?.school_verified ? '인증됨' : '미인증'}</p>
              {profile?.school_verified && (
                <p className="text-sm text-gray-500">{profile.school_generation}기</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">변호사 인증 상태</label>
              <p className="mt-1">{profile?.lawyer_verified ? '인증됨' : '미인증'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">계정 관리</h2>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => router.push('/auth/change-password')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              비밀번호 변경
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
            >
              {isDeleting ? '처리중...' : '회원탈퇴'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
