'use client';

import Link from 'next/link';
import { CardStack } from '@/components/ui/card-stack';
import SchoolSection from '@/components/organisms/school-section';
import type { TopPost } from '@/hooks/useTopPosts';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/molecules/auth-modal';

interface MainContentProps {
  freeboardData: TopPost[];
  leetData: TopPost[];
}

export default function MainContent({ freeboardData, leetData }: MainContentProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSchoolBoardClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      {/* 로고 섹션 */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold" style={{ color: '#FF8A37' }}>
          로스쿨을 얘기하다, 롤로
        </h1>
      </div>

      {/* 게시판 섹션들을 감싸는 컨테이너 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 자유게시판 섹션 */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-8 pl-2.5">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">자유게시판</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                로그인 없이 자유롭게 이용! <br />
                로스쿨에 관심있는 사람부터 교수님까지
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
              <Link
                href="/board/free"
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                게시판 바로가기
              </Link>
            </div>
          </div>
          <div className="relative mt-16 h-[230px]">
            <CardStack items={freeboardData} />
          </div>
        </div>

        {/* 로준게시판 섹션 */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-8 pl-2.5">
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">로준게시판</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                LEET, 자기소개서, 면접 등 정보공유
                <br />
                스터디 모집 등 로준생들을 위한 게시판
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
              <Link
                href="/board/free-student"
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                게시판 바로가기
              </Link>
            </div>
          </div>
          <div className="relative mt-16 h-[230px]">
            <CardStack items={leetData} />
          </div>
        </div>

        {/* 학교별 게시판 섹션 */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-start gap-6 flex-wrap sm:flex-nowrap mb-4 pl-2.5">
            {/* 왼쪽 설명 */}
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                학교별 게시판
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                재학/졸업 인증시 이용 가능
                <br />
                우리 학교만의 프라이빗한 게시판
              </p>
            </div>
            <div className="shrink-0 max-w-[160px] pr-4">
              <Link
                href={isAuthenticated ? "/board/schools" : "#"}
                onClick={handleSchoolBoardClick}
                className="px-5 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                게시판 바로가기
              </Link>
            </div>
          </div>

          {/* 카드 섹션 */}
          <div className="relative mt-16 h-[230px]">
            <SchoolSection />
          </div>
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </main>
  );
}
