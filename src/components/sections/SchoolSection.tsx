'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const cards = [
  {
    id: 1,
    title: '로그인이 필요한 서비스입니다',
    content: '로그인 후 재학생/졸업생 인증을 진행해주세요.',
    buttonText: '로그인하기',
    buttonLink: '/auth/login',
  },
  {
    id: 2,
    title: '학교별 게시판',
    content: '재학/졸업생 인증시 이용 가능',
    buttonText: '자세히 보기',
    buttonLink: '/schools',
  },
];

export default function ClientSection() {
  const [currentCards, setCurrentCards] = useState(cards);
  const { isAuthenticated, isSchoolVerified } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCards(prevCards => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 인증 상태에 따라 카드 내용 동적 변경
  const getDisplayCards = () => {
    if (!isAuthenticated) {
      return [cards[0]]; // 로그인 필요 카드만 표시
    } else if (!isSchoolVerified) {
      return [
        {
          id: 3,
          title: '학교 인증이 필요합니다',
          content: '학교별 게시판 이용을 위해 재학/졸업 인증을 진행해주세요.',
          buttonText: '인증하기',
          buttonLink: '/auth/verify-school',
        }
      ];
    } else {
      return [cards[1]]; // 학교별 게시판 카드 표시
    }
  };

  const displayCards = getDisplayCards();

  return (
    <div className="relative h-60 w-60 md:h-60 md:w-96">
      {displayCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute inset-0 h-60 w-60 md:h-60 md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
          style={{
            transformOrigin: 'top center',
          }}
          animate={{
            top: index * -4,
            scale: 1 - index * 0.06,
            zIndex: displayCards.length - index,
          }}
        >
          <div className="font-normal text-neutral-700 dark:text-neutral-200">
            {card.content}
          </div>
          <div>
            <p className="text-neutral-500 font-medium dark:text-white">
              {card.title}
            </p>
            <Link
              href={card.buttonLink}
              className="text-neutral-200 font-normal dark:text-neutral-200 mt-2 inline-block px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-md text-sm"
            >
              {card.buttonText}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
