import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.username || '사용자'}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
              <div className="mt-3 grid grid-cols-1 gap-4">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-500">닉네임</p>
                  <p className="mt-1">{profile?.username || '설정되지 않음'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">가입일</p>
                  <p className="mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
