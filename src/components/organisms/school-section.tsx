"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardStack, type CardItem } from "@/components/ui/card-stack";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/molecules/auth-modal";

export default function SchoolSection() {
  const router = useRouter();
  const { isAuthenticated, isSchoolVerified } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const schoolData: CardItem[] = useMemo(
    () => [
      {
        id: 1,
        title: "서울대학교 로스쿨",
        content: "서울대학교 로스쿨 게시판입니다.",
        author: "관리자",
        likes: 0,
        categoryName: "서울대",
        categorySlug: "seoul",
      },
      {
        id: 2,
        title: "고려대학교 로스쿨",
        content: "고려대학교 로스쿨 게시판입니다.",
        author: "관리자",
        likes: 0,
        categoryName: "고려대",
        categorySlug: "korea",
      },
    ],
    []
  );

  const handleCardClick = (card: CardItem, e: React.MouseEvent) => {
    // 미로그인: 로그인 모달
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // 로그인했지만 학교 미인증: 인증 페이지로 안내
    if (!isSchoolVerified) {
      router.push(`/auth/verify-school/${card.categorySlug}`);
      return;
    }

    // 인증된 사용자: 해당 게시판으로 이동
    router.push(`/board/${card.categorySlug}`);
  };

  return (
    <>
      <CardStack
        items={schoolData}
        // 내부 링크 이동 대신 클릭 콜백으로 제어
        onCardClick={handleCardClick}
        // 카드 자체 링크는 사용하지 않음
        getHref={() => "#"}
      />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
