// components/UserMenu.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle } from '@/app/auth/actions';
import toast from 'react-hot-toast';

export default function UserMenu() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      // 에러는 useAuth 훅에서 처리됨
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">로딩중...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Google로 로그인
          </button>
        </form>
      </div>
    );
  }

  const displayName = user.profile?.display_name || user.email?.split('@')[0] || '사용자';

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700 dark:text-gray-300">
        안녕하세요, {displayName}님!
      </span>
      <button
        onClick={handleLogout}
        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        로그아웃
      </button>
    </div>
  );
}
