'use client';

import { useRouter } from 'next/navigation';
import type { Category } from '@/types/board';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import AuthRequiredModal from '../auth/AuthRequiredModal';

export interface WriteButtonProps {
  category: Category;
}

export default function WriteButton({ category }: WriteButtonProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem('intendedPath', `/board/${category.slug}/write`);
      setShowAuthModal(true);
      return;
    }

    router.push(`/board/${category.slug}/write`);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        글쓰기
      </button>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="글쓰기는 로그인이 필요합니다."
      />
    </>
  );
}
